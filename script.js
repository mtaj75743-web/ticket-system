
let bookings = JSON.parse(
    localStorage.getItem("ticketBookings") || "[]"
);

function displayBookings() {
    const list = document.getElementById("bookingList");

    if (bookings.length === 0) {
        list.innerHTML = "<p>No bookings yet. Book your first ticket!</p>";
        return;
    }

    list.innerHTML = bookings.map((booking, index) => `
        <div class="booking-item">
            <h3>${booking.event}</h3>
            <p><b>Name:</b> ${booking.name}</p>
            <p><b>Email:</b> ${booking.email}</p>
            <p><b>Date:</b> ${booking.date}</p>
            <p><b>Tickets:</b> ${booking.quantity}</p>
            <p><b>Booking ID:</b> ${booking.id}</p>
            <button onclick="cancelBooking(${index})">
                Cancel Booking
            </button>
        </div>
    `).join("");
}

document.getElementById("bookingForm")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const booking = {
        id: "TK" + Date.now(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        event: document.getElementById("event").value,
        date: document.getElementById("date").value,
        quantity: document.getElementById("quantity").value
    };

    bookings.push(booking);

    localStorage.setItem(
        "ticketBookings",
        JSON.stringify(bookings)
    );

    displayBookings();

    alert("Your demo booking is successful!");

    this.reset();

    document.getElementById("dashboard")
        .scrollIntoView({ behavior: "smooth" });
});

function cancelBooking(index) {
    if (confirm("Are you sure you want to cancel?")) {
        bookings.splice(index, 1);

        localStorage.setItem(
            "ticketBookings",
            JSON.stringify(bookings)
        );

        displayBookings();
    }
}

function showLogin() {
    const email = prompt("Enter your email address:");
    if (email) {
        alert("Welcome! This is a demo sign-in.");
    }
}

displayBookings();
