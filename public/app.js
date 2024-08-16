document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('shortenForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const url = document.getElementById('url').value;
        const customId = document.getElementById('customId').value;
        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, customId }),
            });
            const result = await response.json();
            document.getElementById('result').innerHTML = `
                Click or copy the Shortened URL: <a href="/${result.id}" target="_blank">/${result.id}</a>
                <br>Click Count: <span id="clickCount">0</span>
                <br><div id="qrCode"></div> <!-- QR Code Section -->
            `;
            fetchClickCount(result.id);
            generateQrCode(result.id);
        } catch (error) {
            console.error('Error:', error);
        }
    });

    async function fetchClickCount(id) {
        try {
            const response = await fetch(`/api/analytics/${id}`);
            const result = await response.json();
            document.getElementById('clickCount').textContent = result.count;
        } catch (error) {
            console.error('Error fetching click count:', error);
        }
    }

    async function generateQrCode(id) {
        try {
            const qrResponse = await fetch(`/api/qr/${id}`);
            if (qrResponse.ok) {
                const qrSvg = await qrResponse.text();
                document.getElementById('qrCode').innerHTML = qrSvg;
            } else {
                console.error('Error generating QR code:', qrResponse.statusText);
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }
});
