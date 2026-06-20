package com.school.smart_attendance_backend.service;

import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class PythonServiceManager {

    private Process pythonProcess;

    @PostConstruct
    public void startPythonService() {
        // On Render, Python runs as a separate container — skip local start
        if (System.getenv("RENDER") != null || System.getenv("PYTHON_SERVICE_URL") != null) {
            System.out.println("ℹ️ Running on Render — Python service managed externally.");
            return;
        }

        try {
            System.out.println("🚀 Starting Python Face Recognition Service...");

            String pythonPath = System.getProperty("user.home") + "/IdeaProjects/smart-attendance-backend/python-service";
            String venvPython = pythonPath + "/venv/bin/python";
            String scriptPath = pythonPath + "/face_reconization_service.py";

            java.io.File venvFile = new java.io.File(venvPython);
            java.io.File scriptFile = new java.io.File(scriptPath);
            if (!venvFile.exists() || !scriptFile.exists()) {
                System.out.println("⚠️ Python venv or script not found — skipping local start.");
                return;
            }

            ProcessBuilder pb = new ProcessBuilder(venvPython, scriptPath);
            pb.directory(new java.io.File(pythonPath));
            pb.redirectErrorStream(true);

            pythonProcess = pb.start();

            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(pythonProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[Python] " + line);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();

            Thread.sleep(3000);
            System.out.println("✅ Python service started successfully!");

        } catch (Exception e) {
            System.err.println("❌ Failed to start Python service: " + e.getMessage());
        }
    }

    @PreDestroy
    public void stopPythonService() {
        if (pythonProcess != null && pythonProcess.isAlive()) {
            System.out.println("🛑 Stopping Python Face Recognition Service...");
            pythonProcess.destroy();
            try {
                pythonProcess.waitFor();
            } catch (InterruptedException e) {
                pythonProcess.destroyForcibly();
            }
            System.out.println("✅ Python service stopped.");
        }
    }
}
