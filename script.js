document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = loginForm.username.value;
            // In a real application, you would perform authentication here.
            // For this prototype, we'll just redirect to the dashboard.
            if (username) {
                window.location.href = 'dashboard.html';
            } else {
                alert('Please enter a username.');
            }
        });
    }

    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const fromAccount = transferForm['from-account'].value;
            const toAccount = transferForm['to-account'].value;
            const amount = transferForm.amount.value;

            if (toAccount && amount) {
                // In a real application, you would perform the transfer here.
                alert(`Successfully transferred $${amount} from ${fromAccount} to ${toAccount}.`);
                // Optionally, you could redirect to the history page or update the dashboard.
                window.location.href = 'history.html';
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
});
