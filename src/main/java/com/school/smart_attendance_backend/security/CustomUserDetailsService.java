package com.school.smart_attendance_backend.security;

import com.school.smart_attendance_backend.entity.Student;
import com.school.smart_attendance_backend.entity.Teacher;
import com.school.smart_attendance_backend.repository.StudentRepository;
import com.school.smart_attendance_backend.repository.TeacherRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public CustomUserDetailsService(TeacherRepository teacherRepository, StudentRepository studentRepository) {
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Teacher> teacher = teacherRepository.findByUsername(username);
        if (teacher.isPresent()) {
            Teacher t = teacher.get();
            return new User(t.getUsername(), t.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + t.getRole())));
        }

        Optional<Student> student = studentRepository.findByUsername(username);
        if (student.isPresent()) {
            Student s = student.get();
            return new User(s.getUsername(), s.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + s.getRole())));
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
