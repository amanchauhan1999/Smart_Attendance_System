package com.school.smart_attendance_backend.controller;

import com.school.smart_attendance_backend.entity.AttendanceLog;
import com.school.smart_attendance_backend.entity.Student;
import com.school.smart_attendance_backend.repository.AttendanceLogRepository;
import com.school.smart_attendance_backend.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentRepository studentRepo;
    private final AttendanceLogRepository logRepo;

    public StudentController(StudentRepository studentRepo, AttendanceLogRepository logRepo) {
        this.studentRepo = studentRepo;
        this.logRepo = logRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        var studentOpt = studentRepo.findByUsername(auth.getName());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
        }
        Student student = studentOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", student.getId());
        profile.put("name", student.getName());
        profile.put("rollNo", student.getRollNo());
        profile.put("email", student.getEmail());
        profile.put("photoPath", student.getPhotoPath());
        profile.put("username", student.getUsername());
        profile.put("role", student.getRole());
        profile.put("createdAt", student.getCreatedAt());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/my-attendance")
    public ResponseEntity<?> getMyAttendance(Authentication auth) {
        var studentOpt = studentRepo.findByUsername(auth.getName());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
        }
        Student student = studentOpt.get();
        List<AttendanceLog> logs = logRepo.findByStudentId(student.getId());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyStats(Authentication auth) {
        var studentOpt = studentRepo.findByUsername(auth.getName());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
        }
        Student student = studentOpt.get();
        Map<String, Object> stats = new HashMap<>();
        long totalRecords = logRepo.countByStudentId(student.getId());
        long todayPresent = logRepo.countTodayByStudentId(student.getId());
        long totalDaysActive = logRepo.countDistinctDates();
        double attendancePercentage = totalDaysActive > 0 ? (totalRecords * 100.0 / totalDaysActive) : 0;

        stats.put("studentName", student.getName());
        stats.put("rollNo", student.getRollNo());
        stats.put("totalPresent", totalRecords);
        stats.put("todayPresent", todayPresent);
        stats.put("totalDaysActive", totalDaysActive);
        stats.put("attendancePercentage", Math.round(attendancePercentage * 10.0) / 10.0);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/my-attendance/{date}")
    public ResponseEntity<?> getMyAttendanceByDate(Authentication auth, @PathVariable String date) {
        var studentOpt = studentRepo.findByUsername(auth.getName());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
        }
        Student student = studentOpt.get();
        LocalDate d = LocalDate.parse(date);
        List<AttendanceLog> logs = logRepo.findByDate(d).stream()
                .filter(l -> l.getStudent() != null && l.getStudent().getId().equals(student.getId()))
                .toList();
        return ResponseEntity.ok(logs);
    }
}
