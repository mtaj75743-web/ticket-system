
let bookings = JSON.parse(
    localStorage.getItem("ticketlyBookings") || "[]"
);

const form = document.getElementById("bookingForm");
const list = document.getElementById("bookingList");
const message = document.getElementById("message");

function saveBookings() {
    localStorage.setItem(
        "ticketlyBookings",
        JSON.stringify(bookings)
    );
}

function showBookings() {
    if (bookings.length === 0) {
        list.innerHTML = `
            <div class="empty">
                <h3>No bookings yet!</h3>
                <p>Create your first demo booking.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = bookings.map((b, index) => `
        <div class="booking-item">
            <div>
                <h3>${escapeHTML(b.event)}</h3>
                <p>Name: ${escapeHTML(b.name)}</p>
                <p>Email: ${escapeHTML(b.email)}</p>
                <p>Date: ${escapeHTML(b.date)}</p>
                <p>Tickets: ${escapeHTML(b.quantity)}</p>
                <p>Booking ID: ${escapeHTML(b.id)}</p>
            </div>
            <button onclick="cancelBooking(${index})">
                Cancel Booking
            </button>
        </div>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[c]);
}

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const selectedDate = document.getElementById("date").value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(selectedDate + "T00:00:00") < today) {
        message.textContent = "Please select a future date.";
        return;
    }

    const booking = {
        id: "TK" + Date.now(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        event: document.getElementById("event").value,
        date: selectedDate,
        quantity: document.getElementById("quantity").value
    };

    bookings.push(booking);
    saveBookings();
    showBookings();

    message.textContent = "Demo booking created successfully!";

    form.reset();

    document.getElementById("dashboard")
        .scrollIntoView({ behavior: "smooth" });
});

function cancelBooking(index) {
    if (confirm("Are you sure you want to cancel this booking?")) {
        bookings.splice(index, 1);
        saveBookings();
        showBookings();
    }
}

showBookings();

const dateInput = document.getElementById("date");
const today = new Date();
const offset = today.getTimezoneOffset();
dateInput.min = new Date(today.getTime() - offset * 60000)
    .toISOString().split("T")[0];
