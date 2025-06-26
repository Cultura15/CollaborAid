package com.example.GoogleContacts_Cultura.service;

import com.example.GoogleContacts_Cultura.controller.NotificationController;
import com.example.GoogleContacts_Cultura.entity.TaskEntity;
import com.example.GoogleContacts_Cultura.repository.TaskRepo;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepo taskRepo;
    private final UserRepo userRepo;
    private final NotificationService notificationService;



    public TaskService(TaskRepo taskRepo, UserRepo userRepo, NotificationService notificationService) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;

    }

    // Fetch all tasks with "Active" status
    public List<TaskEntity> getActiveTasks() {
        return taskRepo.findByStatus("ACTIVE");  // Assuming "Active" is a status for ongoing tasks
    }

    // Fetch all tasks with "Inactive" status
    public List<TaskEntity> getInactiveTasks() {
        return taskRepo.findByStatus("INACTIVE");  // Assuming "Inactive" is a status for completed or canceled tasks
    }

    // Deactivate a task by changing its status to "Inactive"
    public boolean deactivateTask(Long taskId) {
        Optional<TaskEntity> optionalTask = taskRepo.findById(taskId);
        if (optionalTask.isPresent()) {
            TaskEntity task = optionalTask.get();
            task.setActiveStatus("INACTIVE");  // Deactivating the task
            taskRepo.save(task);
            return true;
        }
        return false;
    }

    public List<TaskEntity> findAll() {
        return taskRepo.findAll();
    }

    public List<TaskEntity> findTasksByStatus(String status) {
        return taskRepo.findByStatus(status); // Call repository method
    }

    public Optional<TaskEntity> findById(Long id) {
        return taskRepo.findById(id);
    }


    public List<TaskEntity> getPostedTasksByUser(Long userId) {
        return taskRepo.findByUserId(userId);
    }

    public List<TaskEntity> getAcceptedTasksByUser(Long userId) {
        return taskRepo.findByAcceptedById(userId);
    }

    public List<TaskEntity> getTaskHistoryByUser(Long userId) {
        return taskRepo.findDoneTasksByUserOrAccepter(userId);
    }

    public List<TaskEntity> getPendingVerificationTasks(Long userId) {
        return taskRepo.findByUserIdAndStatus(userId, "Pending Verification");
    }



    public TaskEntity save(TaskEntity task, Long userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean hasOngoingTask = taskRepo.existsByUserIdAndStatus(userId, "In Progress") ||
                taskRepo.existsByAcceptedByIdAndStatus(userId, "In Progress") ||
                taskRepo.existsByUserIdAndStatus(userId, "Pending Verification") ||
                taskRepo.existsByAcceptedByIdAndStatus(userId, "Pending Verification");

        if (hasOngoingTask) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must complete and verify your current task before creating a new one.");
        }

        task.setUser(user);
        task.setStatus("Open");
        task.setTimestamp(LocalDateTime.now());

        if (task.getCategory() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task category is required.");
        }

        TaskEntity savedTask = taskRepo.save(task);

        notificationService.sendNotification("New task added: " + savedTask.getTitle(), "TASK_ADDED");

        return savedTask;
    }

    public TaskEntity acceptTask(Long taskId, Long userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        TaskEntity task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // Check if the user has any ongoing task (either as creator or acceptor)
        boolean hasOngoingTask = taskRepo.existsByUserIdAndStatus(userId, "In Progress") ||
                taskRepo.existsByAcceptedByIdAndStatus(userId, "In Progress") ||
                taskRepo.existsByUserIdAndStatus(userId, "Pending Verification") ||
                taskRepo.existsByAcceptedByIdAndStatus(userId, "Pending Verification");

        if (hasOngoingTask) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must complete and verify your current task before accepting a new one.");
        }

        if (!"Open".equalsIgnoreCase(task.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This task is no longer available for acceptance.");
        }

        task.setAcceptedBy(user);
        task.setStatus("In Progress");

        String message = user.getUsername() + " accepted the task \"" + task.getTitle() + "\"";
        notificationService.sendNotificationToUser(message, "TASK_ACCEPTED", task.getUser());


        return taskRepo.save(task);
    }




    //------------------------------------------------------------------------------------------------------------------
    //Verification Part Before Marking Status as "Done"

    public void requestMarkAsDone(Long taskId, Long userId) {
        TaskEntity task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (!userId.equals(task.getUser().getId()) && !userId.equals(task.getAcceptedBy().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to mark this task");
        }

        if ("Done".equals(task.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task is already marked as done");
        }

        if ("Pending Verification".equals(task.getStatus())) {
            if (!task.getMarkedDoneBy().equals(userId)) {
                task.setStatus("Done");
                taskRepo.save(task);
                return;
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Waiting for verification from the other user");
            }
        }

        task.setStatus("Pending Verification");
        task.setMarkedDoneBy(userId);
        taskRepo.save(task);

        // Send notification
        String username = userRepo.findById(userId)
                .map(UserEntity::getUsername)
                .orElse("Unknown User");
        String message = username + " requested to mark the task \"" + task.getTitle() + "\" as done";
        UserEntity targetUser = userId.equals(task.getUser().getId())
                ? task.getAcceptedBy()
                : task.getUser();

        notificationService.sendNotificationToUser(message, "TASK_DONE_REQUESTED", targetUser);

    }

    public void confirmTaskDone(Long taskId, Long userId) {
        TaskEntity task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (!userId.equals(task.getUser().getId()) && !userId.equals(task.getAcceptedBy().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to confirm this task");
        }

        if (!"Pending Verification".equals(task.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task is not pending verification");
        }

        if (!task.getMarkedDoneBy().equals(userId)) {
            task.setStatus("Done");
            taskRepo.save(task);

            // Send notification
            String username = userRepo.findById(userId)
                    .map(UserEntity::getUsername)
                    .orElse("Unknown User");
            String message = username + " confirmed the task \"" + task.getTitle() + "\" as done";
            UserEntity targetUser = userId.equals(task.getUser().getId())
                    ? task.getAcceptedBy()
                    : task.getUser();

            notificationService.sendNotificationToUser(message, "TASK_DONE_CONFIRMED", targetUser);


        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot confirm your own request");
        }
    }





    //------------------------------------------------------------------------------------------------------------------
    //Delete & Update Services

    public boolean deleteById(Long id) {
        if (!taskRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        taskRepo.deleteById(id);
        return true;
    }

    public TaskEntity updateTask(Long taskId, TaskEntity updatedTask, Long userId) {
        TaskEntity existingTask = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!existingTask.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: You can only update your own tasks.");
        }

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setTimestamp(LocalDateTime.now());  // Update timestamp

        return taskRepo.save(existingTask);
    }


}
