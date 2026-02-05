function generateEliteCode(role, fullName, count) {
  const number = String(count + 1).padStart(5, "0");

  if (role === "student") {
    const firstName = fullName.split(" ")[0].toUpperCase();
    return `ELH-STUDENT-${firstName}-${number}`;
  }

  if (role === "admin") {
    return `ADMIN-ELH-${number}`;
  }
}
