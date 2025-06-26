package com.example.GoogleContacts_Cultura.controller;

import com.example.GoogleContacts_Cultura.JWT.JwtUtil;
import com.example.GoogleContacts_Cultura.entity.TaskEntity;
import com.example.GoogleContacts_Cultura.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/task")
public class TaskController {
    private final TaskService taskService;
    private final JwtUtil jwtUtil;

    public TaskController(TaskService taskService, JwtUtil jwtUtil) {
        this.taskService = taskService;
        this.jwtUtil = jwtUtil;
    }

    // CRUD starts here:

    @GetMapping("/all")
    public ResponseEntity<List<TaskEntity>> getAllTasks(){
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskEntity> getTaskById(@PathVariable Long id){
        Optional<TaskEntity> task = taskService.findById(id);
        return task.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get all tasks posted by the logged-in user
    @GetMapping("/posted")
    public ResponseEntity<List<TaskEntity>> getPostedTasksByUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("id", Long.class)); // Extract userId from the token

        List<TaskEntity> tasks = taskService.getPostedTasksByUser(userId);
        return ResponseEntity.ok(tasks);
    }

    // Get all tasks accepted by the logged-in user
    @GetMapping("/accepted")
    public ResponseEntity<List<TaskEntity>> getAcceptedTasksByUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("id", Long.class)); // Extract userId from the token

        List<TaskEntity> tasks = taskService.getAcceptedTasksByUser(userId);
        return ResponseEntity.ok(tasks);
    }

    // Get task history (Done tasks) for the logged-in user
    @GetMapping("/history")
    public ResponseEntity<List<TaskEntity>> getTaskHistoryByUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("id", Long.class)); // Extract userId from the token

        List<TaskEntity> tasks = taskService.getTaskHistoryByUser(userId);
        return ResponseEntity.ok(tasks);
    }

    // Get all tasks with "Pending Verification" status posted by the logged-in user
    @GetMapping("/pending-verification")
    public ResponseEntity<List<TaskEntity>> getPendingVerificationTasks(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("id", Long.class)); // Extract userId from the token

        List<TaskEntity> tasks = taskService.getPendingVerificationTasks(userId);
        return ResponseEntity.ok(tasks);
    }

    //------------------------------------------------------------------------------------------------------------------

    @GetMapping("/open")
    public ResponseEntity<List<TaskEntity>> getOpenTasks() {
        List<TaskEntity> openTasks = taskService.findTasksByStatus("Open"); // Assuming "OPEN" is the status for open tasks
        return ResponseEntity.ok(openTasks);
        // http://localhost:8080/api/task/open
    }

    @GetMapping("/done")
    public ResponseEntity<List<TaskEntity>> getDoneTasks() {
        List<TaskEntity> doneTasks = taskService.findTasksByStatus("Done"); // Assuming "DONE" is the status for completed tasks
        return ResponseEntity.ok(doneTasks);
        // http://localhost:8080/api/task/done
    }

    @GetMapping("/in-progress")
    public ResponseEntity<List<TaskEntity>> getInProgressTasks() {
        List<TaskEntity> inProgressTasks = taskService.findTasksByStatus("In Progress"); // Assuming "IN PROGRESS" is the status for in-progress tasks
        return ResponseEntity.ok(inProgressTasks);
    }

    @PostMapping
    public ResponseEntity<TaskEntity> createTask(@RequestBody TaskEntity task, @RequestParam Long userId) {
        return ResponseEntity.ok(taskService.save(task, userId));
        // http://localhost:8080/api/task?userId=?
    }

    @PostMapping("/{taskId}/accept")
    public ResponseEntity<TaskEntity> acceptTask(@PathVariable Long taskId, @RequestParam Long userId) {
        return ResponseEntity.ok(taskService.acceptTask(taskId, userId));
    }

    //------------------------------------------------------------------------------------------------------------------
    //ACTIVATE / INACTIVATE PART

    @GetMapping("/active")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskEntity> getActiveTasks() {
        return taskService.getActiveTasks();
    }


    @GetMapping("/inactive")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskEntity> getInactiveTasks() {
        return taskService.getInactiveTasks();
    }


    @PutMapping("/{taskId}/deactivate")
    public ResponseEntity<?> deactivateTask(@PathVariable Long taskId) {
        boolean isDeactivated = taskService.deactivateTask(taskId);
        if (isDeactivated) {
            return ResponseEntity.ok("Task deactivated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }
    }


    //------------------------------------------------------------------------------------------------------------------
    //Verification Part Before Marking Status as "Done" CRUD

    @PutMapping("/{taskId}/request-done")
    public ResponseEntity<String> requestMarkAsDone(@PathVariable Long taskId, @RequestParam Long userId) {
        taskService.requestMarkAsDone(taskId, userId);
        return ResponseEntity.ok("Task marked as pending verification.");
    }


    @PutMapping("/{taskId}/confirm-done")
    public ResponseEntity<String> confirmTaskDone(@PathVariable Long taskId, @RequestParam Long userId) {
        taskService.confirmTaskDone(taskId, userId);
        return ResponseEntity.ok("Task marked as done successfully.");
    }

    //------------------------------------------------------------------------------------------------------------------
    //Delete & Update CRUD

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskEntity> updateTask(@PathVariable Long id, @RequestBody TaskEntity updatedTask, @RequestParam Long userId) {
        return ResponseEntity.ok(taskService.updateTask(id, updatedTask, userId));
    }

}
