document.addEventListener('DOMContentLoaded', function () {

    // Check if sales chart exists
    const salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas) {
        const ctx = salesChartCanvas.getContext('2d');

        // Gradient for chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(139, 123, 216, 0.5)'); // Primary color with opacity
        gradient.addColorStop(1, 'rgba(139, 123, 216, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
                datasets: [{
                    label: 'Haftalık Satış (₺)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#8b7bd8', // Primary Color
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#8b7bd8',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

});
