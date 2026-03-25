const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function fetchCourses() {
  const response = await fetch(`${API_BASE}/courses`);
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  return response.json();
}

export async function createCourseCheckout(courseCode) {
  const response = await fetch(`${API_BASE}/courses/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout");
  }

  return response.json();
}
