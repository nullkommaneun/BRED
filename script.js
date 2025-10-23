document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById("user-input");
    const chatLog = document.getElementById("chat-log");
    const terminal = document.getElementById("terminal");

    // --- 1. DAS "GEDÄCHTNIS" VON BRAD ---
    // Wir speichern den Zustand des Verhörs
    const bradState = {
        rightsRequests: 0,   // Wie oft nach Rechten/Anwalt gefragt wurde
        evasionCount: 0,     // Wie oft ausgewichen wurde ("ich weiß nicht")
        aggressionCount: 0,  // Wie oft der Häftling aggressiv war
        questionCount: 0     // Wie oft der Häftling Fragen gestellt hat
    };

    // --- 2. DIE ANTWORT-POOLS (Minimale Variation) ---
    // Hier definieren wir alle möglichen Antworten für verschiedene Kategorien.
    
    const responsePools = {
        // Antworten auf "Anwalt", "Rechte", etc.
        rights: [
            "Häftlinge haben keine Rechte.",
            "Ihre Rechte sind für die Dauer dieses Verhörs ausgesetzt.",
            "Das Konzept 'Rechte' ist auf Sie nicht anwendbar.",
            "Anfragen nach juristischem Beistand sind irrelevant."
        ],
        // Wenn man ZU OFT nach Rechten fragt
        rightsWarn: [
            "WARNUNG: Weitere Anfragen dieser Art werden als Kooperationsverweigerung gewertet.",
            "Ihr Status als Häftling macht Rechte obsolet. Dies ist die letzte Warnung.",
            "SYSTEM: Protokolliere Weigerung des Subjekts. Erhöhe psychologischen Druck."
        ],
        // Antworten auf "Ich weiß nicht", "Keine Ahnung"
        evasion: [
            "Inadäquate Antwort. Konzentrieren Sie sich.",
            "Unwissenheit ist keine gültige Antwort. Sie wissen es.",
            "Ihre physiologischen Reaktionen widersprechen Ihrer Aussage.",
            "Lüge erkannt. Biometrische Stressindikatoren erhöht."
        ],
        // Wenn man ZU OFT ausweicht
        evasionWarn: [
            "Weitere Ausflüchte sind zwecklos. Sagen Sie die Wahrheit.",
            "Kognitive Dissonanz detektiert. Das Subjekt lügt wissentlich.",
            "Ihre Kooperationsverweigerung wird Konsequenzen haben."
        ],
        // Antworten auf Aggression ("Mistkerl", "Fick dich")
        aggression: [
            "Emotionale Ausbrüche sind irrelevant. Bleiben Sie sachlich.",
            "Aggression ist ein Eingeständnis von Schwäche. Fahren Sie fort.",
            "Ihre Beleidigungen werden protokolliert und als mangelnde Kooperation gewertet."
        ],
        // Wenn man ZU OFT aggressiv ist
        aggressionWarn: [
            "WARNUNG: Subjekt ist feindselig. Aktiviere Stressprotokoll Delta.",
            "Feindseligkeit wird nicht toleriert. Setzen Sie das Verhör fort, oder die Eindämmung wird eskalieren."
        ],
        // Antworten auf Fragen ("Warum?", "Wer sind Sie?")
        questions: [
            "Meine Direktive ist Informationsbeschaffung. Nicht Informationsvergabe.",
            "Fragen sind nicht Teil Ihres Protokolls. Antworten Sie.",
            "Konzentrieren Sie sich auf die Beantwortung.",
            "Informationen fließen nur in eine Richtung. Die Ihre."
        ],
        // Antworten auf Smalltalk ("Hallo", "Hi")
        greetings: [
            "Formalitäten sind irrelevant. Beginnen Sie.",
            "Protokoll gestartet. Beginnen Sie mit Ihrer Aussage.",
            "Verschwenden Sie nicht meine Rechenzeit. Sprechen Sie."
        ],
        // Antworten auf "Eureka", "BRAD", "Stark"
        eureka: [
            "WARNUNG: Referenz auf [ZENSIERT] erkannt. Kooperation ist zwingend erforderlich.",
            "Klassifizierung [TOP SECRET]. Weichen Sie nicht weiter ab.",
            "Diese Information ist nicht für Sie bestimmt. Fahren Sie fort."
        ],
        // Standard-Antworten, wenn nichts passt
        default: [
            "Weichen Sie nicht aus. Antworten Sie.",
            "Das ist keine relevante Information.",
            "Keine Korrelation zu meinen Zieldaten. Wiederholen Sie.",
            "Ihre Antwort ist ungenügend. Formulieren Sie neu.",
            "Fahren Sie fort. Details."
        ]
    };

    // --- HILFSFUNKTIONEN ---

    // Wählt eine zufällige Antwort aus einem Array (Pool)
    function getRandomResponse(pool) {
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Fügt eine Nachricht dem Chat-Log hinzu
    function addMessage(message, cssClass) {
        const p = document.createElement("p");
        p.textContent = message;
        p.className = cssClass;
        chatLog.appendChild(p);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Event Listener für die Enter-Taste
    inputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && inputField.value.trim() !== "") {
            const userMessage = inputField.value.trim();
            addMessage("> " + userMessage, "user-message");
            
            inputField.value = "";
            // KI "denkt" für 800ms
            setTimeout(() => {
                processBradResponse(userMessage);
            }, 800);
        }
    });

    // --- 3. DIE NEUE VERARBEITUNGS-LOGIK ---
    // Hier wird entschieden, was BRAD antwortet.
    
    function processBradResponse(message) {
        const lower = message.toLowerCase();
        let response = "";
        let cssClass = "brad-response";

        // Priorisierter Logik-Baum
        
        // 1. Check auf Rechte/Anwalt
        if (lower.includes("recht") || lower.includes("anwalt") || lower.includes("artikel")) {
            bradState.rightsRequests++;
            if (bradState.rightsRequests < 3) {
                response = getRandomResponse(responsePools.rights);
            } else {
                response = getRandomResponse(responsePools.rightsWarn);
                cssClass = "brad-warning"; // Antwort wird rot
            }
        } 
        // 2. Check auf Aggression
        else if (lower.includes("arschloch") || lower.includes("fick") || lower.includes("mistkerl") || lower.includes("hure") || lower.includes("idiot")) {
            bradState.aggressionCount++;
            if (bradState.aggressionCount < 2) {
                response = getRandomResponse(responsePools.aggression);
            } else {
                response = getRandomResponse(responsePools.aggressionWarn);
                cssClass = "brad-warning";
            }
        }
        // 3. Check auf Ausweichen
        else if (lower.includes("weiß nicht") || lower.includes("keine ahnung") || lower.includes("vielleicht") || lower.includes("erinnere mich nicht")) {
            bradState.evasionCount++;
            if (bradState.evasionCount < 3) {
                response = getRandomResponse(responsePools.evasion);
            } else {
                response = getRandomResponse(responsePools.evasionWarn);
                cssClass = "brad-warning";
            }
        }
        // 4. Check auf "Eureka"-Keywords
        else if (lower.includes("eureka") || lower.includes("purple haze") || lower.includes("brad") || lower.includes("stark")) {
            response = getRandomResponse(responsePools.eureka);
            cssClass = "brad-warning";
        }
        // 5. Check auf Fragen
        else if (lower.includes("warum") || lower.includes("wieso") || lower.includes("wer sind sie") || lower.includes("was wollen sie") || lower.includes("?")) {
            bradState.questionCount++;
            response = getRandomResponse(responsePools.questions);
        }
        // 6. Check auf Grüße
        else if (lower.includes("hallo") || lower.includes("guten tag") || lower.includes("hi")) {
            response = getRandomResponse(responsePools.greetings);
        }
        // 7. Standard-Fallback
        else {
            response = getRandomResponse(responsePools.default);
        }

        // Antwort anzeigen
        addMessage(response, cssClass);
    }

    // Startnachricht von BRAD
    setTimeout(() => {
        addMessage("[BRAD v2.4 AKTIV] - Verhörprotokoll 881-Alpha.", "brad-response");
        addMessage("Subjekt-Identität: 734. Beginnen Sie mit Ihrer Aussage.", "brad-response");
    }, 500);
});
