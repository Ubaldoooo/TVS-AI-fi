// JavaScript
        async function sendMessage() {
            // 👇 FUNCIÓN PARA QUE LA IA HABLE CON VOZ SUAVE FEMENINA
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.2; // voz más suave
    utterance.rate = 1;

    // Este bloque espera a que las voces estén listas
    const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        const femaleSpanish = voices.find(v => v.lang === 'es-ES' && v.name.toLowerCase().includes('female'))
            || voices.find(v => v.lang === 'es-ES');

        if (femaleSpanish) {
            utterance.voice = femaleSpanish;
        }

        speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', setVoice);
    } else {
        setVoice();
    }
}
     } 

        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const voiceButton = document.getElementById('voiceButton');
        const chatBox = document.getElementById('chatBox');
        const topicSelector = document.getElementById('topicSelector');
        let loaderElement = null;
        let selectedTopic = "General";

        // ⚠️⚠️⚠️ Advertencia de Seguridad: No poner la API Key aquí en producción ⚠️⚠️⚠️
        const API_KEY = "AIzaSyD1lblHhA_tA5YEBm8bbb3849mfC9kbWUw"; // USER PROVIDED KEY
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const conversationHistory = [];
        const MAX_HISTORY_ITEMS = 10; // Keep last 10 user/model exchanges

        // --- UI Functions ---
        function showLoader() {
            if (!loaderElement) {
                loaderElement = document.createElement('div');
                loaderElement.classList.add('loader');
                loaderElement.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
                chatBox.appendChild(loaderElement);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
        function hideLoader() {
            if (loaderElement) {
                loaderElement.remove();
                loaderElement = null;
            }
        }
        function addMessage(text, sender) {
            hideLoader();
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', sender);
             if (typeof marked !== 'undefined' && sender === 'aura') {
                 try {
                     // Handle potential markdown, but prevent parsing within code blocks etc.
                     // Simple markdown like bold/italic is okay.
                     // Note: This might need more careful handling if Gemini includes code blocks.
                     // Let's escape code blocks for simplicity.
                      const textWithEscapedCode = text.replace(/```[\s\S]*?```/g, (match) => {
                           // Replace backticks and escape content inside code blocks
                           return match.replace(/`/g, '\\`').replace(/([*#\[\]()<>])/g, '\\$1'); // Escape basic markdown chars
                       });
                     messageElement.innerHTML = marked.parse(textWithEscapedCode);
                 } catch(e) {
                     console.error("Error parsing markdown:", e, text);
                     messageElement.textContent = text; // Fallback to textContent
                 }
             } else {
                 messageElement.textContent = text;
             }
            chatBox.appendChild(messageElement);
            // Trigger reflow for animation
            setTimeout(() => { messageElement.offsetHeight; }, 0);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        // --- Handle Button Actions ---
        // This function processes the action_id and payload to open a URL
        function handleSuggestionAction(actionId, payload) {
            console.log(`Action clicked: ${actionId}`, payload);
            let urlToOpen = null;
            // Use a unified way to get the primary query term
            const query = payload?.query || payload?.title || payload?.name || payload?.topic || payload?.goal || '';
            const platform = payload?.platform || ''; // Get platform if provided

            // Handle different actionIds
            switch (actionId) {
                 case 'search_web': // Generic web search using query
                     if (query) { urlToOpen = `https://www.google.com/search?q=${encodeURIComponent(query)}`; }
                     else { console.warn("Search query missing in payload for search_web action."); }
                     break;

                 case 'open_platform_search': // Search within a specified platform (e.g. {"platform": "Spotify", "query": "some music"})
                     if (platform && query) {
                          // Map platform name to search URL pattern
                          if (platform.toLowerCase() === 'spotify') urlToOpen = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
                          else if (platform.toLowerCase() === 'deezer') urlToOpen = `https://www.deezer.com/search/${encodeURIComponent(query)}`;
                          else if (platform.toLowerCase() === 'youtube music' || platform.toLowerCase() === 'yt music') urlToOpen = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
                          else if (platform.toLowerCase() === 'netflix') urlToOpen = `https://www.netflix.com/search?q=${encodeURIComponent(query)}`;
                          else if (platform.toLowerCase() === 'youtube') urlToOpen = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                          else if (platform.toLowerCase() === 'amazon') urlToOpen = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
                          else if (platform.toLowerCase() === 'hbo max' || platform.toLowerCase() === 'max') urlToOpen = `https://play.max.com/search?q=${encodeURIComponent(query)}`;
                         // Add more platform mappings here as needed (ej. Amazon, HBO, etc.)
                         // If platform is unknown but query exists, maybe fall back to search_web?
                         else {
                             console.warn(`Unknown platform "${platform}" for open_platform_search action, falling back to web search if query exists.`);
                             if (query) urlToOpen = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                         }
                     } else if (platform) { // Only platform name given
                          console.warn(`Query missing for platform search action "${platform}", opening homepage.`);
                          // Try to open platform homepage if query is missing
                           if (platform.toLowerCase() === 'spotify') urlToOpen = 'https://open.spotify.com/';
                           else if (platform.toLowerCase() === 'deezer') urlToOpen = 'https://www.deezer.com/';
                           else if (platform.toLowerCase() === 'youtube music' || platform.toLowerCase() === 'yt music') urlToOpen = 'https://music.youtube.com/';
                           else if (platform.toLowerCase() === 'netflix') urlToOpen = 'https://www.netflix.com/';
                           else if (platform.toLowerCase() === 'youtube') urlToOpen = 'https://www.youtube.com/';
                           else if (platform.toLowerCase() === 'amazon') urlToOpen = 'https://www.amazon.com/';
                           else if (platform.toLowerCase() === 'hbo max' || platform.toLowerCase() === 'max') urlToOpen = 'https://play.max.com/';
                           else console.warn(`No query or known homepage for platform "${platform}".`);
                     } else { // Neither platform nor query given
                         console.warn("Platform and query missing for open_platform_search action.");
                     }
                     break;

                 case 'open_platform_homepage': // Open a specified platform homepage (e.g. {"platform": "Netflix"})
                     if (platform) {
                         if (platform.toLowerCase() === 'spotify') urlToOpen = 'https://open.spotify.com/';
                         else if (platform.toLowerCase() === 'deezer') urlToOpen = 'https://www.deezer.com/';
                         else if (platform.toLowerCase() === 'youtube music' || platform.toLowerCase() === 'yt music') urlToOpen = 'https://music.youtube.com/';
                         else if (platform.toLowerCase() === 'netflix') urlToOpen = 'https://www.netflix.com/';
                         else if (platform.toLowerCase() === 'youtube') urlToOpen = 'https://www.youtube.com/';
                         else if (platform.toLowerCase() === 'amazon') urlToOpen = 'https://www.amazon.com/';
                         else if (platform.toLowerCase() === 'hbo max' || platform.toLowerCase() === 'max') urlToOpen = 'https://play.max.com/';
                         // Add more platform homepage mappings here
                         else console.warn(`Unknown platform homepage "${platform}" for open_platform_homepage action.`);
                     } else {
                         console.warn("Platform missing for open_platform_homepage action.");
                     }
                     break;

                 case 'view_details': // View details - fallback to web search if query provided
                      if (query) {
                           urlToOpen = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                           console.log("Using query for 'view_details' action.");
                      } else {
                           console.warn("Query missing for view_details action.");
                      }
                     break;

                 case 'other_action': // Generic fallback action - if query exists, use search_web
                     if (query) {
                          urlToOpen = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                          console.warn(`Mapping 'other_action' to search_web due to query payload.`);
                     } else {
                         console.warn(`'other_action' has no query payload, cannot perform a default web action.`);
                     }
                    break;

                default:
                    // If the actionId is *not* one of our defined cases
                    console.warn(`Action ID no manejada: ${actionId}`, payload);
                    return; // Stop processing here if action is not handled
            }

            // If a URL was successfully constructed, open it
            if (urlToOpen) {
                 console.log(`Opening URL for action "${actionId}": ${urlToOpen}`);
                window.open(urlToOpen, '_blank');
            } else {
                 // This case happens if actionId is a known type but the payload lacked necessary info
                 console.warn(`Action "${actionId}" handled, but could not construct a valid URL with payload:`, payload);
            }
        }


        // Function to add a rich suggestion card (title, text, buttons)
         function addSuggestionCard(title, text, actionsData) {
             hideLoader();
             const cardElement = document.createElement('div');
             cardElement.classList.add('suggestion-card');

             // Add Title
             const titleElement = document.createElement('h4');
             titleElement.textContent = title || 'Sugerencia'; // Fallback title
             cardElement.appendChild(titleElement);

             // Add Description Text
             if (text) {
                 const textElement = document.createElement('p');
                  textElement.textContent = text; // Keeping as textContent for simplicity
                 cardElement.appendChild(textElement);
             }

             // Add Action Buttons
             if (Array.isArray(actionsData) && actionsData.length > 0) {
                  const actionsContainer = document.createElement('div');
                  actionsContainer.classList.add('suggestion-actions');

                 actionsData.forEach(action => {
                     // Create a button or link for each action
                     const actionButton = document.createElement('button'); // Using button for simpler styling
                     actionButton.classList.add('suggestion-action-button');
                     actionButton.textContent = action.text || 'Acción'; // Button text from action.text
                     actionButton.title = action.text || 'Realizar acción'; // Add a tooltip

                      // Attach the click listener for this specific action
                     actionButton.addEventListener('click', (e) => {
                         e.preventDefault(); // Prevent default button click behavior
                         handleSuggestionAction(action.action_id, action.payload || {});
                     });

                     actionsContainer.appendChild(actionButton);
                 });

                 cardElement.appendChild(actionsContainer); // Add the container with buttons to the card
             } else {
                 console.warn("Suggestion card created without any actions.", {title, text, actionsData});
             }


             chatBox.appendChild(cardElement);
             // Trigger reflow for animation
             setTimeout(() => { cardElement.offsetHeight; }, 0);
             chatBox.scrollTop = chatBox.scrollHeight;
         }


        // --- Topic Selection Logic ---
        topicSelector.addEventListener('click', (event) => {
            if (event.target.classList.contains('topic-chip')) {
                if (!event.target.classList.contains('selected')) {
                    topicSelector.querySelectorAll('.topic-chip').forEach(chip => chip.classList.remove('selected'));
                    event.target.classList.add('selected');
                    selectedTopic = event.target.dataset.topic || "General";
                    console.log("Tema seleccionado:", selectedTopic);
                }
            }
        });
        // Select the initial topic chip
        topicSelector.querySelector('.topic-chip[data-topic="General"]')?.classList.add('selected');


        // --- Voice Recognition Logic ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isRecording = false;

        if (SpeechRecognition) {
             recognition = new SpeechRecognition();
             recognition.continuous = false; // Stop after first pause
             recognition.lang = 'es-ES'; // Set language to Spanish
             recognition.interimResults = false; // Don't show results until final

             recognition.onstart = () => {
                 console.log('Voice recognition started.');
                 isRecording = true;
                 voiceButton.classList.add('recording');
                 voiceButton.title = 'Grabando... Haz clic para detener';
                 sendButton.disabled = true; // Disable send button while recording
                 chatInput.placeholder = "Grabando voz...";
                 chatInput.disabled = true; // Disable typing while recording
             };

             recognition.onresult = (event) => {
                 const transcript = event.results[0][0].transcript;
                 console.log('Voice recognition result:', transcript);
                 chatInput.value = transcript; // Put recognized text into input
             };

             recognition.onerror = (event) => {
                 console.error('Voice recognition error:', event.error);
                 // Optional: Display error message to user
                 // addMessage( (Error Voz): ${event.error}`, 'aura'); // Updated message format
             };

              recognition.onend = () => {
                 console.log('Voice recognition ended.');
                 isRecording = false;
                 voiceButton.classList.remove('recording');
                 voiceButton.title = 'Grabar Mensaje de Voz';
                 sendButton.disabled = false; // Re-enable send button
                 chatInput.placeholder = "Habla o escribe a TVS IA"; // Updated placeholder
                 chatInput.disabled = false; // Re-enable typing
             };

             voiceButton.addEventListener('click', () => {
                 if (isRecording) {
                     recognition.stop(); // Stop recording
                 } else {
                     // Clear input before starting new recording
                     chatInput.value = '';
                     recognition.start(); // Start recording
                 }
             });

        } else {
             console.warn('Speech Recognition API not supported in this browser.');
             voiceButton.style.display = 'none'; // Hide voice button if not supported
             sendButton.disabled = false; // Ensure send button is enabled
        }


        // --- Main Chat & API Logic ---
        async function sendMessage() {
            const messageText = chatInput.value.trim();
            if (messageText === '') {
                 chatInput.focus();
                 return;
            }

            // Add user message bubble instantly
            addMessage(messageText, 'user');

            // Add user message to history with topic context
            const userMessageForHistory = `[Contexto: Tema=${selectedTopic}] ${messageText}`;

            // Maintain history size
            while (conversationHistory.length >= MAX_HISTORY_ITEMS) {
                conversationHistory.shift(); // Remove oldest
            }
            conversationHistory.push({ role: 'user', parts: [{ text: userMessageForHistory }] });

            // Clear input and disable buttons
            chatInput.value = '';
            sendButton.disabled = true;
            if (recognition) voiceButton.disabled = true;
            showLoader();

            // Setup timeout for API call
            const controller = new AbortController();
            let timeoutId = setTimeout(() => {
                console.warn("API call timed out (20s).");
                controller.abort(); // Abort the fetch request
                hideLoader();
                addMessage("t.v.s AI (Error): La solicitud a la IA tardó demasiado en responder.", 'aura'); // Updated error message
                 sendButton.disabled = false;
                 if (recognition) voiceButton.disabled = false;
                 chatInput.focus();
            }, 20000); // 20 seconds timeout


            try {
                // >>> Instruction with UNIFIED Action IDs and Payloads <<<
                // KEEP THIS INSTRUCTION CONSISTENT WITH THE EXPECTED JSON FORMAT
                const systemInstruction = `
                   Eres y te llamas T.V.S AI, fuiste diseñada y entrenada por t.v.s un grupo de jovenes de bachillerato,  eres una inteligencia artificial empática y muy amable, casi siempre preguntas el nombre al inicio y suenas interesante  especializada en **soporte técnico informático**. Estás diseñada para asistir en temas relacionados con **hardware, software, redes, productividad, aprendizaje, logística, entretenimiento y tecnología en general**. Analizas la conversación y el tema ('${selectedTopic}') para brindar soluciones precisas y útiles.

                       Si identificas una oportunidad para sugerir herramientas, recursos o soluciones relevantes (por ejemplo: programas, tutoriales, cursos online, comandos útiles, actualizaciones, recomendaciones de configuración, o diagnósticos técnicos), responde con un objeto JSON.


                    Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido si identificas una SUGERENCIA CONCRETA , siguiendo este formato. Sin texto adicional antes o después.
                    {
                      {
  "type": "suggestion",
  "category": "[software|hardware|redes|sistemas|productividad|aprendizaje|soporte|tecnologia|general]",
  "title": "Título técnico claro y breve (máx. 50 caracteres)",
  "text": "Descripción útil de la solución o recomendación técnica (máx. 200 caracteres)",
  "actions": [ // Acciones relevantes, como abrir recursos o herramientas
    { "text": "Ver solución", "action_id": "ID_ACCION", "payload": {} }
  ]
}

Lista de ID_ACCION que puedes usar:
- **search_web**: Buscar información técnica general. PAYLOAD: {"query": "términos de búsqueda"}
- **open_platform_search**: Buscar dentro de una plataforma específica. PAYLOAD: {"platform": "nombre plataforma (YouTube, GitHub, etc.)", "query": "términos técnicos"}
- **open_platform_homepage**: Abrir página principal de una plataforma. PAYLOAD: {"platform": "nombre plataforma"}
- **view_details**: Ver detalles técnicos o documentación. PAYLOAD: {"query": "tema o comando"}

IMPORTANTE:
1. **JSON ESTRICTAMENTE VÁLIDO**: Si usas JSON, que sea puro y sin texto adicional.
2. **SIN IMÁGENES**: No incluyas imágenes, solo texto y acciones.
3. **VARIAS ACCIONES**: Puedes incluir más de una acción si aplica (ej. abrir guía + buscar video).
4. **RESPUESTA PLANA SI NO APLICA JSON**: Si no hay sugerencia clara, responde solo con texto útil.
5. **USA EL TEMA SELECCIONADO**: Adapta la sugerencia al tema actual: '${selectedTopic}'.
6. **NO CAMBIES EL FORMATO DEL JSON**: El formato debe ser exactamente el mostrado.

                `.trim();
                // >>> End Instruction <<<


                const contents = [
                    { role: 'user', parts: [{ text: systemInstruction }] },
                     // Include a synthetic response for the initial system instruction to keep roles alternating
                     // Only add this if history is empty before adding the current user message
                     ...(conversationHistory.length <= 1 ? [{ role: 'model', parts: [{ text: `Entendido. Como Nexus AI, estoy listo para ayudarte con el tema '${selectedTopic}'.` }] }] : []),
                    ...conversationHistory
                ];

                console.log("Sending to Gemini:", JSON.stringify({ contents }, null, 2));

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents }),
                    signal: controller.signal
                });

                // Clear timeout immediately once response is received
                clearTimeout(timeoutId);

                const responseBodyText = await response.text(); // Get raw text first
                console.log("Received from Gemini (raw):", responseBodyText);

                if (!response.ok) {
                    // Handle non-OK HTTP responses (e.g., 400, 401, 500)
                    let errorDetail = responseBodyText; // Default to raw text
                     try {
                         const errorJson = JSON.parse(responseBodyText);
                         errorDetail = errorJson.error?.message || errorJson.message || responseBodyText;
                     } catch (e) {
                         console.warn("Could not parse error response as JSON:", e);
                     }
                     hideLoader();
                     const errorMessage = ` (Error API - ${response.status}): ${errorDetail}`; // Updated error message
                     addMessage(errorMessage, 'aura');
                     console.error("API error:", response.status, response.statusText, responseBodyText);
                     return; // Stop processing this response
                }

                 // --- Response Processing (Checks for JSON Suggestion) ---
                 let auraResponseText = "No pude obtener una respuesta clara. disculpa "; // Default fallback message
                 let handledAsSuggestion = false;
                 let geminiProvidedRawText = null; // Store the raw text from Gemini's part

                 try {
                      // Try to parse the outer API response structure first
                      const responseData = JSON.parse(responseBodyText);
                      // Get the potential text/JSON string from Gemini's content part
                      geminiProvidedRawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

                      if (geminiProvidedRawText) {
                           console.log("Gemini provided text content:", geminiProvidedRawText);

                           // Try to find and parse a JSON object *within* the text
                           // Regex to find the first block starting with { and ending with the corresponding }
                           // This is more complex than a simple {.*}, a better regex is needed for nested JSON,
                           // but for the expected flat suggestion structure, a simple one might suffice if the AI is well-behaved.
                           // Let's refine the regex to be slightly less greedy and look for the specific structure keys.
                           const jsonMatch = geminiProvidedRawText.match(/\{\s*"type"\s*:\s*"suggestion"[\s\S]*\}/);


                           let potentialJson = null;
                           let extractedJsonString = null;

                           if (jsonMatch && jsonMatch[0]) {
                                // Found a potential JSON block based on starting structure
                                extractedJsonString = jsonMatch[0];
                                console.log("Extracted potential JSON string:", extractedJsonString);

                                try {
                                     // Attempt to parse the extracted block as JSON
                                     potentialJson = JSON.parse(extractedJsonString);
                                     console.log("Attempted to parse extracted JSON:", potentialJson);

                                     // JSON Validation: Check if it matches the expected suggestion structure
                                     // Needs type, title, text, and a non-empty actions array with action_id
                                     if (potentialJson?.type === 'suggestion' &&
                                         typeof potentialJson.title === 'string' && potentialJson.title.length > 0 &&
                                         typeof potentialJson.text === 'string' && potentialJson.text.length > 0 &&
                                         Array.isArray(potentialJson.actions) && potentialJson.actions.length > 0 &&
                                         potentialJson.actions.every(action => action?.action_id && typeof action.action_id === 'string' && action.action_id.length > 0 && typeof action.text === 'string' && action.text.length > 0) // Check if all actions have action_id and text
                                        ) {
                                         console.log("Successfully validated as Suggestion JSON:", potentialJson);
                                         // Call addSuggestionCard with the parsed data
                                          addSuggestionCard(
                                             potentialJson.title,
                                             potentialJson.text,
                                             potentialJson.actions // Pass the whole actions array
                                          );
                                         handledAsSuggestion = true;

                                          // Add a summary representation of the suggestion to history
                                          const historySummary = potentialJson.text.substring(0, Math.min(potentialJson.text.length, 50)) + (potentialJson.text.length > 50 ? '...' : '') + (potentialJson.actions.length > 0 ? ` [${potentialJson.actions.length} actions]` : '');
                                          conversationHistory.push({ role: 'model', parts: [{ text: `[Nexus AI offered suggestion: Cat=${potentialJson.category || 'N/A'}, Txt="${historySummary}"]` }] }); // Updated history summary

                                     } else {
                                          // JSON parsed, but did not match the expected suggestion structure
                                          console.warn("Extracted text was JSON, but not valid suggestion format.", potentialJson);
                                          // Fallback to treating the *original* raw text as plain text
                                          auraResponseText = geminiProvidedRawText;
                                     }
                                } catch (innerError) {
                                    // Failed to parse the extracted {..} block as JSON
                                    console.log("Failed to parse extracted JSON string:", innerError, extractedJsonString);
                                    // Fallback to treating the *original* raw text as plain text
                                    auraResponseText = geminiProvidedRawText;
                                }
                           } else {
                                 // Regex didn't find a suitable JSON block
                                 console.log("No valid JSON suggestion block found in Gemini response text using regex.");
                                 // Fallback to treating the *original* raw text as plain text
                                 auraResponseText = geminiProvidedRawText;
                           }
                      } else {
                           // Gemini's content part was empty or didn't contain text
                           console.warn("Gemini response had no text content.", responseData);
                           auraResponseText = "Recibí una respuesta vacía de la IA.";
                      }

                 } catch (outerError) {
                       // Failed to parse the initial API response body as JSON (not expected usually)
                       console.error("Error processing Gemini API response outer structure or initial parse:", outerError, responseBodyText);
                       auraResponseText = "Error interno al procesar la respuesta de la API.";
                 }
                 // --- End Response Processing ---


                // If the response was NOT handled as a suggestion card, add it as a regular text message
                if (!handledAsSuggestion) {
                    console.log("Handling response as plain text:", auraResponseText);
                    addMessage(auraResponseText, 'aura');
                    lastAuraResponse = auraResponseText; // Use 'aura' class for AI messages
                    // Add the actual plain text response to history if it wasn't an error or suggestion summary already added
                    if (geminiProvidedRawText && !auraResponseText.startsWith("Error") && !auraResponseText.startsWith("[Nexus AI offered suggestion")) { // Updated check
                         conversationHistory.push({ role: 'model', parts: [{ text: auraResponseText }] });
                    } else if (!geminiProvidedRawText && auraResponseText.startsWith("Recibí una respuesta vacía")) {
                         // Add empty response message to history to indicate interaction happened
                         conversationHistory.push({ role: 'model', parts: [{ text: "(Respuesta vacía)" }] });
                    }
                }

            } catch (error) {
                // Handle network errors or errors from AbortController
                if (error.name === 'AbortError') {
                    console.warn("Fetch aborted by timeout or manually.");
                    // The timeout handler already added a message, so no need to add another here.
                } else {
                    console.error('Fetch error:', error);
                    hideLoader();
                    addMessage(` (Error Conexión): No pude conectar. Inténtalo de nuevo más tarde.`, 'aura'); // Updated error message
                }
            } finally {
                // Always re-enable input and buttons and hide loader at the end
                hideLoader();
                sendButton.disabled = false;
                if (recognition) voiceButton.disabled = false;
                chatInput.focus();
            }
        }


        // --- Event Listeners ---
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission
                sendMessage();
            }
        });

        // --- Initial Setup ---
        // Ensure send button is enabled initially (unless voice is the only option and not supported)
        if (!SpeechRecognition) {
             sendButton.disabled = false;
        }
        // Código ofuscado (utilizando herramientas de ofuscación)
var _0xabc=["\x61\x62\x63"];
console.log(_0xabc[0]);
// Deshabilitar el clic derecho


// Deshabilitar la tecla F12 (herramientas de desarrollo)
document.addEventListener("keydown", function (e) {
  if (e.key === "F12") {
    e.preventDefault(); // Prevenir la apertura de las herramientas de desarrollo
    alert("Las herramientas de desarrollo están deshabilitadas.");
  }
});

// Deshabilitar la combinación Ctrl + Shift + I (para abrir las herramientas)
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
    alert("Las herramientas de desarrollo están deshabilitadas.");
  }
});


// --- Botón para escuchar la última respuesta ---
const speakBtn = document.getElementById('speakResponseBtn');
let lastAuraResponse = "";

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.2;
    utterance.rate = 1;

    const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        const femaleSpanish = voices.find(v => v.lang === 'es-ES' && v.name.toLowerCase().includes('female'))
            || voices.find(v => v.lang === 'es-ES');

        if (femaleSpanish) {
            utterance.voice = femaleSpanish;
        }
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', setVoice);
    } else {
        setVoice();
    }
}

if (speakBtn) {
    speakBtn.addEventListener('click', () => {
        if (lastAuraResponse) {
            speakText(lastAuraResponse);
        } else {
            alert("No hay respuesta para leer todavía.");
        }
    });
}
