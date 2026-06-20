package com.school.smart_attendance_backend.repository;

import com.school.smart_attendance_backend.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    List<AttendanceLog> findByStudentId(Long studentId);

    List<AttendanceLog> findByDate(LocalDate date);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM AttendanceLog a " +
            "WHERE a.student.id = :studentId AND a.date = :date")
    boolean existsByStudentIdAndDate(@Param("studentId") Long studentId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT a.date) FROM AttendanceLog a")
    long countDistinctDates();

    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.student.id = :studentId")
    long countByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.status = 'PRESENT' AND a.date = CURRENT_DATE")
    long countTodayPresent();

    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.student.id = :studentId AND a.date = CURRENT_DATE")
    long countTodayByStudentId(@Param("studentId") Long studentId);

    List<AttendanceLog> findTop50ByOrderByTimestampDesc();

    @Query("SELECT a FROM AttendanceLog a LEFT JOIN FETCH a.student ORDER BY a.timestamp DESC")
    List<AttendanceLog> findTop50WithStudent();

    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.date BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.date = :date AND a.status = 'PRESENT'")
    long countPresentByDate(@Param("date") LocalDate date);
}
