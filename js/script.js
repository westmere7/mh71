fetch('https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vQcb0QGpzWkW2JV8sZbXzkCJr2AiRwiZNtf3i0g7Frp3NsOwAjOcma--HupkdlGrKiu1guF3OZIJ0r0/pubhtml?gid=70362248&single=true')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, 'text/html');
        const tableBody = htmlDoc.querySelector('tbody');

        const submitBtn = document.getElementById('submit-btn');
        const phoneNumberInput = document.getElementById('phone-number');
        const resultDiv = document.getElementById('result');
        const totalBox = document.getElementById('total-box');
        const breakdownDiv = document.getElementById('breakdown');
        let cells;

        submitBtn.addEventListener('click', () => {
            const phoneNumber = phoneNumberInput.value.trim();
            const rows = tableBody.querySelectorAll('tr');
            let total = 0;
            let found = false;

            rows.forEach(row => {
                cells = row.querySelectorAll('td');
                const phone = cells[2].textContent.trim(); // Assuming Phone column is the third column (index 2)

                if (phone === phoneNumber) {
                    total = parseFloat(cells[9].textContent.replaceAll(',', '')); // Assuming Total column is the tenth column (index 9)
                    found = true;

                    // Extract additional details
                    const tenantName = cells[1].textContent; // Assuming Tenant Name is in the second column (index 1)
                    const roomNumber = cells[0].textContent; // Assuming Room Number is in the first column (index 0)

                    // Display breakdown details
                    breakdownDiv.style.display = 'block';
                    breakdownDiv.innerHTML = `
                                            <div class="breakdown-item">
                            <span class="breakdown-label">Tháng:</span>
                            <span class="breakdown-value"><b>${cells[14].textContent}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Người thuê:</span>
                            <span class="breakdown-value"><b>${tenantName}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Số phòng:</span>
                            <span class="breakdown-value"><b>${roomNumber}</b></span>
                        </div>

                        <div class="breakdown-item">
                            <span class="breakdown-label">Cập nhật:</span>
                            <span class="breakdown-value"><b>${cells[15].textContent}</b></span>
                        </div>
                        <hr class="breakdown-divider">
                        <div class="breakdown-item">
                            <span class="breakdown-label">Số điện tháng trước:</span>
                            <span class="breakdown-value"><b>${cells[3].textContent}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Số điện tháng này:</span>
                            <span class="breakdown-value"><b>${cells[4].textContent}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Số điện dùng:</span>
                            <span class="breakdown-value"><b>${cells[5].textContent}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Tiền điện (x3000 ₫):</span>
                            <span class="breakdown-value"><b>${cells[6].textContent}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Tiền phòng:</span>
                            <span class="breakdown-value"><b>${cells[7].textContent}</b></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Tiền rác:</span>
                            <span class="breakdown-value"><b>${cells[8].textContent}</b></span>
                        </div>
                        <hr class="breakdown-divider">
                                                <div class="breakdown-item">
                            <span class="breakdown-label">Lưu ý:</span>
                            <span class="breakdown-value"><b>${cells[13].textContent}</b></span>
                        </div>
                        

                    `;
                }
            });

            if (found) {
                resultDiv.textContent = `Tổng số tiền cần thanh toán`;
                totalBox.style.display = 'block';

                const countTotal = (start, end, duration) => {
                    let current = 0;
                    const increment = total / duration * 40;
                    const timer = setInterval(() => {
                        current += increment;
                        totalBox.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(current);
                        if (current >= total) {
                            clearInterval(timer);
                            totalBox.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
                        }
                    }, 20);
                };

                countTotal(0, total, 1000);
            } else {
                resultDiv.innerHTML = '<strong>Không tìm thấy thông tin</strong>';
                totalBox.textContent = '';
                totalBox.style.display = 'none';
                breakdownDiv.innerHTML = `
                    Vui lòng kiểm tra số điện thoại và thử lại.<br>
                    Số dt này phải trùng số liên lạc Zalo với chủ phòng trọ.
                `;
                breakdownDiv.classList.add('extra-note'); // Apply the new class for extra note styling
                breakdownDiv.style.display = 'block'; // Display the additional note
            }

            // Add flash animation to the button
            submitBtn.classList.add('flash');
            submitBtn.addEventListener('animationend', () => {
                submitBtn.classList.remove('flash');
            }, { once: true });
        });

        // Enable the button if the phone number field contains only numbers
        phoneNumberInput.addEventListener('input', () => {
            const phoneNumberValue = phoneNumberInput.value.trim();
            const isNumeric = /^\d+$/.test(phoneNumberValue);
            submitBtn.disabled = !isNumeric;
        });
    });

// Copy account number to clipboard
document.getElementById('copy-btn').addEventListener('click', () => {
    const accountNumber = document.getElementById('account-number').textContent;
    navigator.clipboard.writeText(accountNumber).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.textContent = 'Đã copy STK';
        copyBtn.style.backgroundColor = '#28a745'; // Change button color to green
    }).catch(err => {
        console.error('Không thể copy:', err);
    });
});