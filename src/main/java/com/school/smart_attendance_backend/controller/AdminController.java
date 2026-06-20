package com.school.smart_attendance_backend.controller;

import com.school.smart_attendance_backend.entity.AttendanceLog;
import com.school.smart_attendance_backend.entity.Student;
import com.school.smart_attendance_backend.entity.Teacher;
import com.school.smart_attendance_backend.repository.AttendanceLogRepository;
import com.school.smart_attendance_backend.repository.StudentRepository;
import com.school.smart_attendance_backend.repository.TeacherRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StudentRepository studentRepo;
    private final TeacherRepository teacherRepo;
    private final AttendanceLogRepository logRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminController(StudentRepository studentRepo, TeacherRepository teacherRepo,
                           AttendanceLogRepository logRepo, PasswordEncoder passwordEncoder) {
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
        this.logRepo = logRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepo.count());
        stats.put("totalTeachers", teacherRepo.count());
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

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return studentRepo.findById(id).map(student -> {
            if (updates.containsKey("name")) student.setName((String) updates.get("name"));
            if (updates.containsKey("email")) student.setEmail((String) updates.get("email"));
            if (updates.containsKey("rollNo")) student.setRollNo((String) updates.get("rollNo"));
            if (updates.containsKey("active")) student.setActive((Boolean) updates.get("active"));
            studentRepo.save(student);
            return ResponseEntity.ok(Map.of("message", "Student updated", "student", student));
        }).orElse(ResponseEntity.badRequest().body(Map.of("message", "Student not found")));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        if (studentRepo.existsById(id)) {
            studentRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
    }

    @PostMapping(value = "/students", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createStudent(
            @RequestParam("rollNo") String rollNo,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            if (studentRepo.existsByUsername(username)) {
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
            student.setUsername(username);
            student.setPassword(passwordEncoder.encode(password));
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

    @PutMapping("/teachers/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return teacherRepo.findById(id).map(teacher -> {
            if (updates.containsKey("fullName")) teacher.setFullName((String) updates.get("fullName"));
            if (updates.containsKey("email")) teacher.setEmail((String) updates.get("email"));
            if (updates.containsKey("role")) teacher.setRole((String) updates.get("role"));
            if (updates.containsKey("active")) teacher.setActive((Boolean) updates.get("active"));
            if (updates.containsKey("password") && updates.get("password") != null) {
                teacher.setPassword(passwordEncoder.encode((String) updates.get("password")));
            }
            teacherRepo.save(teacher);
            return ResponseEntity.ok(Map.of("message", "Teacher updated", "teacher", teacher));
        }).orElse(ResponseEntity.badRequest().body(Map.of("message", "Teacher not found")));
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

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherRepo.findAll());
    }

    @PostMapping("/teachers")
    public ResponseEntity<?> addTeacher(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String email = body.get("email");
        String role = body.getOrDefault("role", "TEACHER");

        if (teacherRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        Teacher teacher = new Teacher(username, passwordEncoder.encode(password), fullName, email, role);
        teacherRepo.save(teacher);
        return ResponseEntity.ok(Map.of("message", "Teacher added", "id", teacher.getId()));
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        if (teacherRepo.existsById(id)) {
            teacherRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Teacher deleted"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Teacher not found"));
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

    @GetMapping("/attendance/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<AttendanceLog> logs = getFilteredLogs(startDate, endDate);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);
        writer.println("Student Name,Roll No,Status,Date,Time");
        for (AttendanceLog log : logs) {
            String name = log.getStudent() != null ? log.getStudent().getName() : "";
            String roll = log.getStudent() != null ? log.getStudent().getRollNo() : "";
            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    name, roll, log.getStatus(),
                    log.getDate() != null ? log.getDate().toString() : "",
                    log.getTimestamp() != null ? log.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : "");
        }
        writer.flush();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(out.toByteArray());
    }

    @GetMapping("/attendance/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<AttendanceLog> logs = getFilteredLogs(startDate, endDate);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.addCell("Student Name");
            table.addCell("Roll No");
            table.addCell("Status");
            table.addCell("Date");
            table.addCell("Time");

            for (AttendanceLog log : logs) {
                table.addCell(log.getStudent() != null ? log.getStudent().getName() : "");
                table.addCell(log.getStudent() != null ? log.getStudent().getRollNo() : "");
                table.addCell(log.getStatus() != null ? log.getStatus() : "");
                table.addCell(log.getDate() != null ? log.getDate().toString() : "");
                table.addCell(log.getTimestamp() != null ? log.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : "");
            }

            document.add(table);
            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private List<AttendanceLog> getFilteredLogs(String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            return logRepo.findTop50WithStudent().stream()
                    .filter(l -> !l.getDate().isBefore(start) && !l.getDate().isAfter(end))
                    .toList();
        }
        return logRepo.findTop50WithStudent();
    }
}
