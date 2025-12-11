/**
 * Initializes EmailJS using the public key stored in CONFIG.
 */
(function() {
    emailjs.init(CONFIG.PUBLIC_KEY);
})();

document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('sendBtn');
    const statusDiv = document.getElementById('status');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const previewGrid = document.getElementById('previewGrid');
    const descriptionInput = document.getElementById('description');
    const systemCheckboxes = document.querySelectorAll('.system-checkbox');
    const ticketSelect = document.getElementById('ticketType');
    const priorityRadios = document.querySelectorAll('input[name="priority"]');
    
    let base64Images = [];
    let textFile = { name: "", content: "" };
    const MAX_FILES = 3;


    /**
     * Saves the current form state (inputs, selections, images, files) to localStorage.
     * Triggered on every change to ensure data isn't lost if the popup closes.
     */
    function saveDraft() {
        const draft = {
            ticketType: ticketSelect.value,
            priority: document.querySelector('input[name="priority"]:checked').value,
            description: descriptionInput.value,
            systems: Array.from(document.querySelectorAll('.system-checkbox:checked')).map(c => c.value),
            images: base64Images, 
            textFile: textFile
        };
        try {
            localStorage.setItem('suporte_draft', JSON.stringify(draft));
        } catch (e) {
            console.warn("Quota exceeded! Images might be too big to save draft.", e);
        }
    }

    /**
     * Loads the saved draft from localStorage and populates the form fields and previews.
     * Called on initialization.
     */
    function loadDraft() {
        const saved = localStorage.getItem('suporte_draft');
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                
                if(draft.ticketType) ticketSelect.value = draft.ticketType;
                if(draft.description) descriptionInput.value = draft.description;
                
                if(draft.priority) {
                    const radio = document.querySelector(`input[name="priority"][value="${draft.priority}"]`);
                    if(radio) radio.checked = true;
                }

                if(draft.systems && Array.isArray(draft.systems)) {
                    systemCheckboxes.forEach(chk => {
                        chk.checked = draft.systems.includes(chk.value);
                    });
                }

                if (draft.images && Array.isArray(draft.images)) {
                    base64Images = draft.images;
                }
                if (draft.textFile) {
                    textFile = draft.textFile;
                }

                renderPreviews();

            } catch (e) {
                console.error("Error loading draft", e);
            }
        }
        validateForm(); 
    }

    /**
     * Clears the saved draft from localStorage and resets internal state.
     * Called after a successful email submission.
     */
    function clearDraft() {
        localStorage.removeItem('suporte_draft');
        base64Images = [];
        textFile = { name: "", content: "" };
        renderPreviews();
    }


    /**
     * Compresses an image file using a canvas element and returns the result as Base64.
     * @param {File} file - The image file to be compressed.
     * @returns {Promise<string>} A promise that resolves to the compressed Base64 image.
     */
    function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
            };
        });
    }

    /**
     * Reads a text-based file (TXT, XML, JSON, LOG) and returns its name and content.
     * @param {File} file - The file uploaded by the user.
     * @returns {Promise<{name: string, content: string}>} A promise containing file name and content.
     */
    function readTextFile(file) {
        return new Promise((resolve, reject) => {
            const MAX_SIZE_BYTES = 50000;
            if (file.size > MAX_SIZE_BYTES) { 
                alert("File too large! Max 50kb.");
                reject("File too large");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: file.name, content: e.target.result });
            reader.readAsText(file);
        });
    }

    /**
     * Renders all image and text/XML file previews inside the preview grid.
     * Clears previous previews before updating.
     */
    function renderPreviews() {
        previewGrid.innerHTML = '';
        
        base64Images.forEach((base64, index) => createThumbnail(base64, index, true));

        if (textFile.content) {
            createThumbnail('https://cdn-icons-png.flaticon.com/512/136/136538.png', 0, false);
        }

        updateDropZone();
    }

    /**
     * Creates a preview thumbnail for either an image or a text/XML file.
     * @param {string} src - Base64 source or icon URL.
     * @param {number} index - Index of the file in its respective list.
     * @param {boolean} isImage - True if the preview is for an image; false for a text/XML file.
     */
    function createThumbnail(src, index, isImage) {
        const container = document.createElement('div');
        container.className = 'thumbnail-container';
        
        const img = document.createElement('img');
        img.src = src;
        img.className = 'thumbnail-img';
        if (!isImage) img.title = textFile.name;

        const btn = document.createElement('button');
        btn.className = 'btn-remove-thumb';
        btn.innerHTML = '×';
        btn.onclick = () => {
            if (isImage) base64Images.splice(index, 1);
            else textFile = { name: "", content: "" };
            renderPreviews();
            saveDraft();
        };

        container.appendChild(img);
        container.appendChild(btn);
        previewGrid.appendChild(container);
    }

    /**
     * Updates the dropzone text and visibility based on how many files are already uploaded.
     */
    function updateDropZone() {
        const totalItems = base64Images.length + (textFile.content ? 1 : 0);
        const dropText = dropZone.querySelector('p');
        
        if (totalItems >= MAX_FILES) {
            dropZone.style.display = 'none';
        } else {
            dropZone.style.display = 'block';
        }
    }

    /**
     * Processes images and text/XML files from input, drag-and-drop or paste events.
     * @param {FileList|File[]} files - The list of files to process.
     * @returns {Promise<void>}
     */
    async function processFiles(files) {
        for (let file of files) {
            const totalItems = base64Images.length + (textFile.content ? 1 : 0);
            if (totalItems >= MAX_FILES) break;

            try {
                if (file.type.startsWith('image/')) {
                    const img = await compressImage(file);
                    base64Images.push(img);
                } else if (file.name.endsWith('.xml') || file.type === 'text/xml' || file.type === 'application/json' || file.name.endsWith('.txt') || file.name.endsWith('.log')) {
                    if (textFile.content) {
                        alert("Only 1 text/XML file allowed.");
                    } else {
                        textFile = await readTextFile(file);
                    }
                }
            } catch (err) { console.error(err); }
        }
        renderPreviews();
        saveDraft();
    }

    /**
     * Validates the form by checking if a description is filled
     * and at least one system checkbox is selected.
     * Enables or disables the submit button accordingly.
     */
    function validateForm() {
        const hasDescription = descriptionInput.value.trim().length > 0;
        const hasSystem = Array.from(systemCheckboxes).some(chk => chk.checked);
        
        sendBtn.disabled = !(hasDescription && hasSystem);
        sendBtn.style.opacity = sendBtn.disabled ? "0.5" : "1";
        sendBtn.style.cursor = sendBtn.disabled ? "not-allowed" : "pointer";
    }

    /**
     * Detects the user's operating system based on the browser User-Agent string.
     * @param {string} ua - Browser User-Agent.
     * @returns {string} The detected operating system name.
     */
    function getOS(ua) {
        if (ua.includes("Win")) return "Windows";
        if (ua.includes("Mac")) return "MacOS";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("like Mac")) return "iOS";
        return "Unknown OS";
    }

    descriptionInput.addEventListener('input', () => { validateForm(); saveDraft(); });
    ticketSelect.addEventListener('change', saveDraft);
    systemCheckboxes.forEach(chk => chk.addEventListener('change', () => { validateForm(); saveDraft(); }));
    priorityRadios.forEach(radio => radio.addEventListener('change', saveDraft));
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) processFiles(e.target.files);
        fileInput.value = '';
    });

    document.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        const files = [];
        for (let item of items) {
            if (item.type.startsWith("image")) files.push(item.getAsFile());
        }
        if (files.length) { e.preventDefault(); processFiles(files); }
    });

    /**
     * Handles sending the ticket through EmailJS.
     * Collects metadata, screenshots, text/XML files, and browser context
     * before submitting all data to the EmailJS template.
     */
    sendBtn.addEventListener("click", function () {
        sendBtn.disabled = true;
        sendBtn.innerHTML = "⏳ Enviando...";
        statusDiv.textContent = "Processando...";
        statusDiv.style.color = "#666";

        const ticketSelect = document.getElementById('ticketType');
        
        const categoryMap = {
            'bug': 'Bug - Erro',
            'feature': 'Nova Funcionalidade',
            'suggestion': 'Sugestão de Melhoria',
        };
        const selectedValue = ticketSelect.value;
        const cleanCategory = categoryMap[selectedValue] || selectedValue;

        const priority = document.querySelector('input[name="priority"]:checked').value;
        const description = descriptionInput.value;
        const selectedSystems = Array.from(document.querySelectorAll('.system-checkbox:checked'))
            .map(chk => chk.value).join(', ');

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];           
            chrome.tabs.sendMessage(activeTab.id, { action: "collectData" }, function(response) {
                const data = response || { url: activeTab.url || "N/A", userAgent: navigator.userAgent, resolution: "N/A" };

                const img1 = base64Images[0] || "";
                const img2 = base64Images[1] || "";
                const img3 = base64Images[2] || "";
                const hasFile = textFile.content ? true : false;

                const templateParams = {
                    categoria: cleanCategory,
                    prioridade: priority.toUpperCase(),
                    sistemas: selectedSystems || "None",
                    descricao: description,
                    url_origem: data.url,
                    navegador: data.userAgent,
                    so_limpo: getOS(data.userAgent),
                    tipo_dispositivo: /Mobi|Android/i.test(data.userAgent) ? "📱 Mobile" : "💻 Desktop",
                    resolucao: data.resolution,
                    
                    img1: img1, vis1: img1 ? "block" : "none", height1: img1 ? "auto" : "0px",
                    img2: img2, vis2: img2 ? "block" : "none", height2: img2 ? "auto" : "0px",
                    img3: img3, vis3: img3 ? "block" : "none", height3: img3 ? "auto" : "0px",

                    nome_arquivo: textFile.name,
                    conteudo_arquivo: textFile.content,
                    vis_arquivo: hasFile ? "block" : "none"
                };

                emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, templateParams)
                    .then(() => {
                        statusDiv.textContent = "✅ Successo!";
                        statusDiv.style.color = "green";
                        sendBtn.innerHTML = "Enviado!";
                        
                        clearDraft();
                        
                        setTimeout(() => window.close(), 2500);
                    })
                    .catch((err) => {
                        console.error("EmailJS Error:", err);
                        
                        let messageError = "❌ Erro ao enviar.";

                        if (err.status === 413) {
                            messageError = "❌ Arquivoss muito grandes! (Limite de 50kb excedido!)";
                        } 
                        else if (err.status === 400) {
                            messageError = "❌ Config Error (Check Keys/Template)";
                        }
                        else if (err.text) {
                            messageError = "❌ " + err.text;
                        }

                        statusDiv.textContent = messageError;
                        statusDiv.style.color = "red";
                        sendBtn.disabled = false;
                        sendBtn.innerHTML = "Try Again";
                    });
            });
        });
    });

    loadDraft();
});
