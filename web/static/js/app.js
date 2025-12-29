// Helper function to show loading state
function setLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="loading"></span> Procesando PDF...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Extract Text from PDF Form Handler
document.getElementById('extractForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const button = document.getElementById('extractBtn');
    const resultDiv = document.getElementById('result');

    setLoading(button, true);
    resultDiv.innerHTML = '<p style="text-align: center;">Procesando PDF, esto puede tomar unos momentos...</p>';

    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error processing request');
        }

        let downloadsHtml = '';
        if (data.downloads) {
            downloadsHtml = `
                <div style="margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a href="${data.downloads.txt}" download class="btn-download">📄 Descargar TXT</a>
                    <a href="${data.downloads.markdown}" download class="btn-download">📝 Descargar Markdown</a>
                    <a href="${data.downloads.json}" download class="btn-download">📊 Descargar JSON</a>
                </div>
            `;
        }

        resultDiv.innerHTML = `
            <h3>Resultado:</h3>
            <p><strong>Archivo:</strong> ${escapeHtml(data.filename)}</p>
            <p><strong>Total de páginas:</strong> ${data.total_pages}</p>
            <p><strong>Palabras detectadas:</strong> ${data.total_lines}</p>
            <p><strong>Procesado:</strong> ${new Date(data.processed_at).toLocaleString()}</p>
            ${downloadsHtml}
            <h4>Texto extraído:</h4>
            <pre>${escapeHtml(data.full_text || 'No se detectó texto')}</pre>
        `;
    } catch (error) {
        resultDiv.innerHTML = `
            <p class="error-message">Error: ${escapeHtml(error.message)}</p>
        `;
    } finally {
        setLoading(button, false);
    }
});



// Update file input label when PDF is selected
document.getElementById('extractFile').addEventListener('change', (e) => {
    const label = e.target.nextElementSibling;
    const file = e.target.files[0];

    if (file) {
        label.textContent = file.name;
    } else {
        label.textContent = 'Seleccionar archivo PDF';
    }
});
