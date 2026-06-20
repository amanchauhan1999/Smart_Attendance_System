#!/bin/bash
# Seed test students via admin API
# Usage: bash seed-students.sh

BACKEND="https://smart-attendance-backend-jnt4.onrender.com"

echo "Logging in as admin..."
TOKEN=$(curl -s -X POST "$BACKEND/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"hod_admin","password":"Hod@Admin#2026!x"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Try running locally with IntelliJ first."
  exit 1
fi

echo "Token: ${TOKEN:0:20}..."

STUDENTS=(
  "STU001|Aarav Sharma|aarav@school.com|aarav|Stu@Aarav#2026!"
  "STU002|Diya Patel|diya@school.com|diya|Stu@Diya#2026!"
  "STU003|Rohan Gupta|rohan@school.com|rohan|Stu@Rohan#2026!"
  "STU004|Ananya Singh|ananya@school.com|ananya|Stu@Ananya#2026!"
  "STU005|Vivaan Kumar|vivaan@school.com|vivaan|Stu@Vivaan#2026!"
  "STU006|Priyanka Reddy|priyanka@school.com|priyanka|Stu@Priyanka#2026!"
  "STU007|Kabir Joshi|kabir@school.com|kabir|Stu@Kabir#2026!"
  "STU008|Nisha Verma|nisha@school.com|nisha|Stu@Nisha#2026!"
)

for s in "${STUDENTS[@]}"; do
  IFS='|' read -r roll name email username password <<< "$s"
  echo "Creating $name ($roll)..."
  curl -s -X POST "$BACKEND/api/admin/students" \
    -H "Authorization: Bearer $TOKEN" \
    -F "rollNo=$roll" \
    -F "name=$name" \
    -F "email=$email" \
    -F "username=$username" \
    -F "password=$password"
  echo ""
done

echo "Done! Students created."
echo ""
echo "Login credentials:"
for s in "${STUDENTS[@]}"; do
  IFS='|' read -r roll name email username password <<< "$s"
  echo "  $username / $password"
done
