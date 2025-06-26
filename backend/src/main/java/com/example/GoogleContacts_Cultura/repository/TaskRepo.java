package com.example.GoogleContacts_Cultura.repository;

import com.example.GoogleContacts_Cultura.entity.TaskEntity;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<TaskEntity, Long> {

//    List<TaskEntity> findByUser(UserEntity user);
    List<TaskEntity> findByUserId(Long userId);
    List<TaskEntity> findByAcceptedById(Long userId);
    List<TaskEntity> findByStatus(String status);
    List<TaskEntity> findByUserIdAndStatus(Long userId, String status);



    // Fetch tasks based on their active status (ACTIVE/INACTIVE)
    List<TaskEntity> findByActiveStatus(String activeStatus);  // Now uses activeStatus

    @Query("SELECT t FROM TaskEntity t WHERE t.status = 'Done' AND (t.user.id = :userId OR t.acceptedBy.id = :userId)")
    List<TaskEntity> findDoneTasksByUserOrAccepter(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) > 0 FROM TaskEntity t WHERE t.user.id = :userId AND t.status = :status")
    boolean existsByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("SELECT COUNT(t) > 0 FROM TaskEntity t WHERE t.acceptedBy.id = :userId AND t.status = :status")
    boolean existsByAcceptedByIdAndStatus(@Param("userId") Long userId, @Param("status") String status);


}
