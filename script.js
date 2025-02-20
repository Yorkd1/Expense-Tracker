// Store expense objects and total amount
let expenses = [];
let totalAmount = 0;

// Assign constants from the HTML elements in index
const categorySelect = document.getElementById("category-select");
const amountInput = document.getElementById("amount-input");
const dateInput = document.getElementById("date-input");
const addExpenseButton = document.getElementById("add-button");
const expenseTableBody = document.getElementById("expense-table-body");
const totalAmountDisplay = document.getElementById("total-amount");

// Add an expense to the expense list as well as update the table
function addExpense() {
    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    // Handle user input errors
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense amount.");
        return;
    }
    if (!date) {
        alert("Please select a valid date for the expense.");
        return;
    }

    // Create a new expense object and add it to the expenses array
    const expense = { category, amount, date };
    expenses.push(expense);

    // Update the total amount and reflect it in the UI
    totalAmount += amount;
    updateTotalDisplay();

    // Add new row to the table for the expense
    addExpenseToTable(expense);
    updateChart();
}

// Function to update the total amount
function updateTotalDisplay() {
    totalAmountDisplay.textContent = totalAmount.toFixed(2);
}

// Format the date from expense object to be MM/DD/YYYY
function formatDateToDisplay(dateString) {
    const[year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
}

// Convert a date back to YYYY-MM-DD for sorting
function formatDateToSortable(dateString) {
    const [month, day, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
}

// Create a new row in the table for an expense and add it to the expense table
function addExpenseToTable(expense) {
    const newRow = expenseTableBody.insertRow();

    // Insert cells to populate it with object elements
    newRow.innerHTML = `
        <td>${expense.category}</td>
        <td>${expense.amount.toFixed(2)}</td>
        <td>${formatDateToDisplay(expense.date)}</td>
        <td><button class="delete-button">Delete</button></td>
    `;

    // Add delete button event listener to delete unwanted rows from table
    const deleteButton = newRow.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => removeExpense(expense, newRow));
}

// Function to find and remove an expense from the expense list
function removeExpense(expense, rowElement) {
    const index = expenses.indexOf(expense);
    if (index !== -1) {
        expenses.splice(index, 1);
    }

    // Subtract deleted expense cost from total amount
    totalAmount -= expense.amount;
    updateTotalDisplay();

    // Remove row from the table
    expenseTableBody.removeChild(rowElement);

    // Update chart when expense is removed
    updateChart();
}

// Attach event listener to the "Add" button
addExpenseButton.addEventListener("click", addExpense);


// ===============================================================

// Create the chart for the table using the expense objects stored in the list

// Get reference to the canvas element for the chart
const expenseChartCanvas = document.getElementById("expenseChart");
let expenseChart; 

// When expense is added a color is chosen for each category
function getColor(index) {
    const colors = [
        "rgba(255, 99, 132, 1)",  
        "rgba(54, 162, 235, 1)",  
        "rgba(75, 192, 192, 1)",  
        "rgba(255, 206, 86, 1)",  
    ];
    return colors[index % colors.length]; 
}


// Function to generate and update the expense chart
function updateChart() {

    // Group expenses by category and track them over time
    const categoryData = {};
    const uniqueDates = new Set();

    expenses.forEach(expense => {

        // Ensure date format is MM/DD/YYYY
        const formattedDate = formatDateToDisplay(expense.date); 

        if (!categoryData[expense.category]) {
            categoryData[expense.category] = {};
        }

        if (!categoryData[expense.category][formattedDate]) {
            categoryData[expense.category][formattedDate] = 0;
        }

        categoryData[expense.category][formattedDate] += expense.amount;
        uniqueDates.add(formattedDate);
    });

    // Convert uniqueDates to a sorted array for the X-axis
    const sortedDates = Array.from(uniqueDates)
    .map(date => ({ original: date, sortable: formatDateToSortable(date) }))
    .sort((a, b) => new Date(a.sortable) - new Date(b.sortable))
    .map(dateObj => dateObj.original);

    // Generate datasets for each category and determine color
    const datasets = Object.keys(categoryData).map((category, index) => {
        return {
            label: category,
            data: sortedDates.map(date => categoryData[category][date] || 0),
            borderColor: getColor(index), 
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 4
        };
    });

    // If the chart already exists, destroy it to avoid duplicates
    if (expenseChart) {
        expenseChart.destroy();
    }

    // Create a new line chart
    expenseChart = new Chart(expenseChartCanvas, {
        type: "line",
        data: {
            labels: sortedDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Date"
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Expense Amount ($)"
                    }
                }
            }
        }
    });
}

// Call updateChart() whenever an expense is added or removed
addExpenseButton.addEventListener("click", updateChart);

