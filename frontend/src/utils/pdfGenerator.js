import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

export const generateTripPDF = async (tripId) => {
    try {
        // 1. Fetch full details (re-using existing endpoint)
        const res = await api.get(`/trips/${tripId}`);
        const trip = res.data;

        // 2. Init PDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        // --- HEADER ---
        doc.setFontSize(18);
        doc.text(`Wniosek Delegacyjny #${trip.id}`, 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Status: ${trip.status?.name || '-'}`, 14, 28);
        doc.text(`Data generowania: ${new Date().toLocaleDateString()}`, 150, 20);

        // --- EMPLOYEE & PURPOSE ---
        doc.setLineWidth(0.5);
        doc.line(14, 32, 196, 32);

        doc.setFontSize(12);
        doc.text("Dane Pracownika i Cel", 14, 40);
        
        doc.setFontSize(10);
        doc.text([
            `Pracownik: ${trip.user?.firstName} ${trip.user?.lastName} (${trip.user?.email})`,
            `Cel wyjazdu: ${trip.purpose}`,
            `Kierunek: ${trip.destination?.name}, ${trip.destination?.country?.name}`,
            `Termin: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
        ], 14, 48);

        // --- COST SUMMARY ---
        let startY = 70;
        doc.setFontSize(12);
        doc.text("Podsumowanie Kosztów (Estymacja vs Rozliczenie)", 14, startY);
        
        const estCost = trip.estimatedCost ? parseFloat(trip.estimatedCost).toFixed(2) : "0.00";
        const finalCost = trip.settlement?.totalAmount ? parseFloat(trip.settlement.totalAmount).toFixed(2) : "-";

        autoTable(doc, {
            startY: startY + 5,
            head: [['Typ', 'Kwota (PLN)']],
            body: [
                ['Szacowany Koszt (Plan)', estCost],
                ['Całkowity Koszt (Rozliczenie)', finalCost],
            ],
            theme: 'striped',
            headStyles: { fillColor: [66, 66, 66] }
        });

        // --- SETTLEMENT ITEMS (If any) ---
        if (trip.settlement?.items?.length > 0) {
            startY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(12);
            doc.text("Szczegóły Rozliczenia (Wydatki)", 14, startY);

            const rows = trip.settlement.items.map(item => [
                new Date(item.date).toLocaleDateString(),
                item.description || '-',
                item.payer === 'employer' ? 'Firma' : 'Pracownik',
                `${parseFloat(item.amount).toFixed(2)} PLN`
            ]);

            autoTable(doc, {
                startY: startY + 5,
                head: [['Data', 'Opis', 'Płatnik', 'Kwota']],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            });
        }

        // --- FOOTER (Dynamic from DB - ZSI Requirement 19) ---
        let footerText = "Dokument wygenerowany automatycznie.";
        try {
            const tempRes = await api.get('/templates/PDF_FOOTER');
            if(tempRes.data?.content) footerText = tempRes.data.content;
        } catch(e) { console.warn("Footer template fetch failed"); }

        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Strona ${i} z ${pageCount}`, 105, 290, null, null, "center");
            doc.text(footerText, 105, 285, null, null, "center");
        }

        // 3. Save
        doc.save(`Delegacja_${trip.id}.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Błąd generowania PDF: " + error.message);
    }
};
