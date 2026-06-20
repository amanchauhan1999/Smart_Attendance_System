package com.school.smart_attendance_backend.controller;

import com.school.smart_attendance_backend.entity.AttendanceLog;
import com.school.smart_attendance_backend.entity.Student;
import com.school.smart_attendance_backend.repository.AttendanceLogRepository;
import com.school.smart_attendance_backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private AttendanceLogRepository logRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(value = "/students", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addStudent(
            @RequestParam("rollNo") String rollNo,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam("photo") MultipartFile photo) {

        try {
            Optional<Student> existing = studentRepo.findByRollNo(rollNo);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Student already exists with roll number: " + rollNo));
            }

            String studentUsername = (username != null && !username.isEmpty()) ? username : rollNo;
            if (studentRepo.existsByUsername(studentUsername)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username already exists: " + studentUsername));
            }

            String photoPath = savePhoto(photo, rollNo);

            Student student = new Student();
            student.setRollNo(rollNo);
            student.setName(name);
            student.setEmail(email);
            student.setUsername(studentUsername);
            student.setPassword(passwordEncoder.encode((password != null && !password.isEmpty()) ? password : rollNo));
            student.setRole("STUDENT");
            student.setPhotoPath(photoPath);
            student.setActive(true);

            studentRepo.save(student);
            return ResponseEntity.ok(Map.of("message", "Student added!", "studentId", student.getId()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getStudents() {
        return ResponseEntity.ok(studentRepo.findAll());
    }

    @PostMapping("/attendance")
    public ResponseEntity<Map<String, Object>> markAttendance(
            @RequestParam String rollNo,
            @RequestParam(required = false) String studentName) {

        try {
            int hour = java.time.LocalTime.now().getHour();
            if (hour < 7 || hour >= 17) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Attendance is only allowed between 7:00 AM and 5:00 PM"
                ));
            }

            Optional<Student> studentOpt = studentRepo.findByRollNo(rollNo);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Student not found: " + rollNo
                ));
            }

            Student student = studentOpt.get();

            LocalDate today = LocalDate.now();
            if (logRepo.existsByStudentIdAndDate(student.getId(), today)) {
                return ResponseEntity.ok().body(Map.of(
                        "success", false,
                        "message", "Already marked today: " + student.getName() + " (" + rollNo + ")"
                ));
            }

            AttendanceLog log = new AttendanceLog();
            log.setStudent(student);
            log.setStatus("PRESENT");
            log.setTimestamp(LocalDateTime.now());
            log.setDate(today);
            logRepo.save(log);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Attendance marked for " + student.getName() + " (" + rollNo + ")",
                    "studentName", student.getName(),
                    "rollNo", rollNo,
                    "timestamp", log.getTimestamp().toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error: " + e.getMessage()
            ));
        }
    }

    private String savePhoto(MultipartFile photo, String rollNo) throws Exception {
        String uploadDir = "src/main/resources/static/uploads/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = rollNo + "_" + System.currentTimeMillis() + ".jpg";
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, photo.getBytes());

        return "/uploads/" + fileName;
    }
}
