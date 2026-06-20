package com.school.smart_attendance_backend.repository;

import com.school.smart_attendance_backend.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUsername(String username);
    boolean existsByUsername(String username);
}
