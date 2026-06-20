package com.school.smart_attendance_backend.controller;

import com.school.smart_attendance_backend.entity.AttendanceLog;
import com.school.smart_attendance_backend.entity.Student;
import com.school.smart_attendance_backend.entity.Teacher;
import com.school.smart_attendance_backend.repository.AttendanceLogRepository;
import com.school.smart_attendance_backend.repository.StudentRepository;
import com.school.smart_attendance_backend.repository.TeacherRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final TeacherRepository teacherRepo;
    private final StudentRepository studentRepo;
    private final AttendanceLogRepository logRepo;
    private final PasswordEncoder passwordEncoder;

    public TeacherController(TeacherRepository teacherRepo, StudentRepository studentRepo,
                             AttendanceLogRepository logRepo, PasswordEncoder passwordEncoder) {
        this.teacherRepo = teacherRepo;
        this.studentRepo = studentRepo;
        this.logRepo = logRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        return teacherRepo.findByUsername(auth.getName())
                .map(teacher -> {
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("id", teacher.getId());
                    profile.put("username", teacher.getUsername());
                    profile.put("fullName", teacher.getFullName());
                    profile.put("email", teacher.getEmail());
                    profile.put("role", teacher.getRole());
                    profile.put("createdAt", teacher.getCreatedAt());
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("message", "Teacher not found")));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepo.count());
        stats.put("totalAttendanceRecords", logRepo.count());
        stats.put("todayAttendance", logRepo.countTodayPresent());
        stats.put("totalDaysActive", logRepo.countDistinctDates());

        long totalStudents = studentRepo.count();
        long todayPresent = logRepo.countTodayPresent();
        double todayPercentage = totalStudents > 0 ? (todayPresent * 100.0 / totalStudents) : 0;
        stats.put("todayPercentage", todayPercentage);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepo.findAll());
    }

    @PostMapping(value = "/students", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createStudent(
            @RequestParam("rollNo") String rollNo,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            String studentUsername = (username != null && !username.isEmpty()) ? username : rollNo;
            if (studentRepo.existsByUsername(studentUsername)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
            }

            Optional<Student> existingRoll = studentRepo.findByRollNo(rollNo);
            if (existingRoll.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Roll number already exists: " + rollNo));
            }

            Student student = new Student();
            student.setRollNo(rollNo);
            student.setName(name);
            student.setEmail(email);
            student.setUsername(studentUsername);
            student.setPassword(passwordEncoder.encode((password != null && !password.isEmpty()) ? password : rollNo));
            student.setRole("STUDENT");
            student.setActive(true);

            if (photo != null && !photo.isEmpty()) {
                String photoPath = saveStudentPhoto(photo, rollNo);
                student.setPhotoPath(photoPath);
            }

            studentRepo.save(student);
            return ResponseEntity.ok(Map.of("message", "Student created successfully", "studentId", student.getId()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceLog>> getAttendanceLogs(
            @RequestParam(required = false) String date) {

        List<AttendanceLog> logs;
        if (date != null && !date.isEmpty()) {
            LocalDate d = LocalDate.parse(date);
            logs = logRepo.findByDate(d);
        } else {
            logs = logRepo.findTop50WithStudent();
        }
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(
            @RequestParam String rollNo) {

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
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error: " + e.getMessage()
            ));
        }
    }

    private String saveStudentPhoto(MultipartFile photo, String rollNo) throws Exception {
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
