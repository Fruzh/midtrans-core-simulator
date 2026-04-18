lucide.createIcons();

let pollingInterval = null;
let currentQRUrl = '';

function newOrderId() {
    document.getElementById('order_id').value = 'ORDER-' + Math.floor(Math.random() * 100000);
}

newOrderId();

function togglePaymentInfo(show) {
    const leftCol = document.getElementById('leftColumn');
    const rightCol = document.getElementById('rightColumn');
    const mainCard = document.getElementById('mainCard');

    document.getElementById('vaContainer').classList.add('hidden');
    document.getElementById('merchantIdContainer').classList.add('hidden');
    document.getElementById('mandiriContainer').classList.add('hidden');
    document.getElementById('qrContainer').classList.add('hidden');


    if (show) {
        document.getElementById('formSection').classList.add('hidden');
        rightCol.classList.add('hidden');
        leftCol.classList.remove('md:w-1/2', 'bg-slate-50/50', 'border-r');
        leftCol.classList.add('w-full');
        mainCard.classList.remove('max-w-6xl');
        mainCard.classList.add('max-w-2xl');
        document.getElementById('paymentInfo').classList.remove('hidden');
    } else {
        newOrderId();
        document.getElementById('formSection').classList.remove('hidden');
        rightCol.classList.remove('hidden');
        leftCol.classList.add('md:w-1/2', 'bg-slate-50/50', 'border-r');
        leftCol.classList.remove('w-full');
        mainCard.classList.remove('max-w-2xl');
        mainCard.classList.add('max-w-6xl');
        document.getElementById('paymentInfo').classList.add('hidden');
        stopPolling();
    }
}

async function checkStatus(orderId) {
    try {
        const response = await fetch(`${STATUS_URL}/${orderId}`);
        const data = await response.json();
        if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
            stopPolling();
            document.getElementById('successModal').classList.remove('hidden');
        }
    } catch (err) { }
}

function startPolling(orderId) {
    stopPolling();
    pollingInterval = setInterval(() => checkStatus(orderId), 3000);
}

function stopPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
}

function copyText(elementId, btn) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text);
    const originalIcon = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-500"></i>`;
    lucide.createIcons();
    btn.classList.add('copy-success');
    setTimeout(() => {
        btn.innerHTML = originalIcon;
        lucide.createIcons();
        btn.classList.remove('copy-success');
    }, 2000);
}

function copyQRUrl(btn) {
    navigator.clipboard.writeText(currentQRUrl);
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i> Copied!`;
    lucide.createIcons();
    setTimeout(() => {
        btn.innerHTML = originalText;
        lucide.createIcons();
    }, 2000);
}

document.getElementById('payButton').addEventListener('click', async function () {
    const formData = {
        firstName: document.getElementById('first_name').value || "Guest",
        email: document.getElementById('email').value || "guest@example.com",
        phone: document.getElementById('phone').value || "08123456789",
        amount: document.getElementById('gross_amount').value,
        orderId: document.getElementById('order_id').value,
        paymentMethod: document.querySelector('input[name="payment_method"]:checked').value
    };

    const btn = this;
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('btnSpinner');

    btn.disabled = true;
    btnText.innerText = "Processing...";
    spinner.classList.remove('hidden');

    let payload = {
        transaction_details: { order_id: formData.orderId, gross_amount: parseInt(formData.amount) },
        customer_details: { first_name: formData.firstName, email: formData.email, phone: formData.phone }
    };

    if (['bca', 'bni', 'bri', 'permata', 'cimb', 'bsi'].includes(formData.paymentMethod)) {
        payload.payment_type = 'bank_transfer';
        payload.bank_transfer = { bank: formData.paymentMethod };
    } else if (formData.paymentMethod === 'mandiri') {
        payload.payment_type = 'echannel';
        payload.echannel = { bill_info1: "Simulation", bill_info2: "Payment" };
    } else if (['alfamart', 'indomaret'].includes(formData.paymentMethod)) {
        payload.payment_type = 'cstore';
        payload.cstore = { store: formData.paymentMethod, message: "Payment Simulation" };
    } else {
        payload.payment_type = formData.paymentMethod;
    }

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok) {
            togglePaymentInfo(true);

            const paymentMethod = formData.paymentMethod;
            const paymentCode = data.payment_code ||
                (data.va_numbers && data.va_numbers[0]?.va_number) ||
                data.permata_va_number ||
                data.va_number ||
                data.bill_key || "";

            const billerCode = data.biller_code || "";
            const merchantId = paymentMethod === 'indomaret' ? (data.merchant_id || "G105809989") : "";

            document.getElementById('vaContainer').classList.add('hidden');
            document.getElementById('merchantIdContainer').classList.add('hidden');
            document.getElementById('mandiriContainer').classList.add('hidden');
            document.getElementById('qrContainer').classList.add('hidden');

            let simulatorUrl = data.redirect_url || SIMULATOR_MAP[paymentMethod] || "#";
            document.getElementById('simulatorBtn').href = simulatorUrl;

            const selectedRadio = document.querySelector('input[name="payment_method"]:checked');
            if (selectedRadio) {
                const logoSrc = selectedRadio.closest('label').querySelector('img').src;
                document.getElementById('methodLogo').src = logoSrc;
            }

            let hasInfo = false;

            if (billerCode && paymentCode) {
                document.getElementById('mandiriContainer').classList.remove('hidden');
                document.getElementById('billerCodeDisplay').innerText = billerCode;
                document.getElementById('billKeyDisplay').innerText = paymentCode;
                hasInfo = true;
            } else if (data.actions && data.actions.some(a => a.name === 'generate-qr-code') && paymentMethod !== 'gopay') {
                const qrAction = data.actions.find(a => a.name === 'generate-qr-code');
                document.getElementById('qrContainer').classList.remove('hidden');
                document.getElementById('qrDisplay').src = qrAction.url;
                document.getElementById('qrLabel').innerText = 'Scan QR Code';
                currentQRUrl = qrAction.url;
                hasInfo = true;
            } else if (paymentCode) {
                document.getElementById('vaContainer').classList.remove('hidden');
                document.getElementById('vaNumberDisplay').innerText = paymentCode;

                if (paymentMethod === 'indomaret' || paymentMethod === 'alfamart' || paymentMethod === 'akulaku') {
                    document.getElementById('vaTitle').innerText = 'Payment Code';
                } else {
                    document.getElementById('vaTitle').innerText = 'Virtual Account';
                }

                if (merchantId) {
                    document.getElementById('merchantIdContainer').classList.remove('hidden');
                    document.getElementById('merchantIdDisplay').innerText = merchantId;
                }
                hasInfo = true;
            }

            if (paymentMethod === 'gopay') {
                const gopayRedirect = data.actions ? data.actions.find(a => a.name === 'deeplink-redirect') : null;
                if (gopayRedirect) {
                    const gopaySimUrl = `${SIMULATOR_MAP['gopay']}?url=${encodeURIComponent(gopayRedirect.url)}`;
                    document.getElementById('simulatorBtn').href = gopaySimUrl;
                }
            }

            const resultDetailsBox = document.querySelector('#paymentInfo > .bg-white');
            resultDetailsBox.classList.remove('hidden');

            const logoContainer = document.getElementById('methodLogoContainer');
            if (hasInfo) {
                logoContainer.classList.add('mb-10', 'pb-6', 'border-b', 'border-slate-50');
            } else {
                logoContainer.classList.remove('mb-10', 'pb-6', 'border-b', 'border-slate-50');
            }

            startPolling(formData.orderId);
        }
    } catch (error) {
        alert("Terjadi kesalahan.");
    } finally {
        btn.disabled = false;
        btnText.innerText = "Bayar Sekarang";
        spinner.classList.add('hidden');
    }
});
