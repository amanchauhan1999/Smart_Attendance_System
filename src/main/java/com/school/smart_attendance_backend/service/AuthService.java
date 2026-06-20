package com.school.smart_attendance_backend.service;

import com.school.smart_attendance_backend.dto.LoginRequest;
import com.school.smart_attendance_backend.dto.RegisterRequest;
import com.school.smart_attendance_backend.entity.Student;
import com.school.smart_attendance_backend.entity.Teacher;
import com.school.smart_attendance_backend.repository.StudentRepository;
import com.school.smart_attendance_backend.repository.TeacherRepository;
import com.school.smart_attendance_backend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(TeacherRepository teacherRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public Map<String, Object> register(RegisterRequest request) {
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "TEACHER";

        if (role.equals("STUDENT")) {
            return registerStudent(request);
        }
        return registerTeacher(request, role);
    }

    private Map<String, Object> registerTeacher(RegisterRequest request, String role) {
        if (teacherRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        Teacher teacher = new Teacher(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getEmail(),
                role
        );
        teacherRepository.save(teacher);

        String token = jwtTokenProvider.generateToken(teacher.getUsername(), teacher.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Teacher registered successfully");
        result.put("token", token);
        result.put("fullName", teacher.getFullName());
        result.put("username", teacher.getUsername());
        result.put("role", teacher.getRole());
        return result;
    }

    private Map<String, Object> registerStudent(RegisterRequest request) {
        Optional<Student> existing = studentRepository.findByUsername(request.getUsername());
        if (existing.isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        Student student = new Student();
        student.setUsername(request.getUsername());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setName(request.getFullName());
        student.setEmail(request.getEmail());
        student.setRole("STUDENT");
        studentRepository.save(student);

        String token = jwtTokenProvider.generateToken(student.getUsername(), student.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Student registered successfully");
        result.put("token", token);
        result.put("fullName", student.getName());
        result.put("username", student.getUsername());
        result.put("role", student.getRole());
        return result;
    }

    public Map<String, Object> login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Optional<Teacher> teacher = teacherRepository.findByUsername(request.getUsername());
        if (teacher.isPresent()) {
            Teacher t = teacher.get();
            String token = jwtTokenProvider.generateToken(t.getUsername(), t.getRole());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("fullName", t.getFullName());
            result.put("username", t.getUsername());
            result.put("role", t.getRole());
            return result;
        }

        Optional<Student> student = studentRepository.findByUsername(request.getUsername());
        if (student.isPresent()) {
            Student s = student.get();
            String token = jwtTokenProvider.generateToken(s.getUsername(), s.getRole());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("fullName", s.getName());
            result.put("username", s.getUsername());
            result.put("role", s.getRole());
            result.put("rollNo", s.getRollNo());
            return result;
        }

        throw new RuntimeException("User not found");
    }
}
