package com.example.collaboraid.api

import com.example.collaboraid.model.Task
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface TaskService {
    @GET("task/all")
    suspend fun getAllTasks(@Header("Authorization") token: String): Response<List<Task>>

    @GET("task/open")
    suspend fun getOpenTasks(@Header("Authorization") token: String): Response<List<Task>>

    @GET("task/in-progress")
    suspend fun getInProgressTasks(@Header("Authorization") token: String): Response<List<Task>>

    @GET("task/done")
    suspend fun getDoneTasks(@Header("Authorization") token: String): Response<List<Task>>

    @GET("task/{id}")
    suspend fun getTaskById(@Path("id") taskId: Long, @Header("Authorization") token: String): Response<Task>

    @POST("task")
    suspend fun createTask(@Body task: Task, @Query("userId") userId: Long, @Header("Authorization") token: String): Response<Task>

    @POST("task/{taskId}/accept")
    suspend fun acceptTask(
        @Path("taskId") taskId: Long,
        @Query("userId") userId: Long,
        @Header("Authorization") token: String
    ): Response<Task>

    @PUT("task/{taskId}/request-done")
    suspend fun requestMarkAsDone(
        @Path("taskId") taskId: Long,
        @Query("userId") userId: Long,
        @Header("Authorization") token: String
    ): Response<String>

    @PUT("task/{taskId}/confirm-done")
    suspend fun confirmTaskDone(
        @Path("taskId") taskId: Long,
        @Query("userId") userId: Long,
        @Header("Authorization") token: String
    ): Response<String>

    // Updated endpoints that don't require userId in path
    @GET("task/accepted")
    suspend fun getAcceptedTasksByUser(@Header("Authorization") token: String): Response<List<Task>>

    @GET("task/history")
    suspend fun getTaskHistoryByUser(@Header("Authorization") token: String): Response<List<Task>>

    @GET("task/posted")
    suspend fun getTasksPostedByUser(@Header("Authorization") token: String): Response<List<Task>>
}