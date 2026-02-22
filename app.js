document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const targetAmountInput = document.getElementById('targetAmount');
    const monthlyPaymentInput = document.getElementById('monthlyPayment');
    const deliveryConditionInput = document.getElementById('deliveryCondition');
    const totalTermInput = document.getElementById('totalTerm');
    const orgFeeInput = document.getElementById('orgFee');
    const startMonthInput = document.getElementById('startMonth');

    // Varsayılan tarih
    const today = new Date();
    startMonthInput.value = today.toISOString().split('T')[0];

    // Labels
    const deliveryConditionLabel = document.getElementById('deliveryConditionLabel');
    const orgFeeLabel = document.getElementById('orgFeeLabel');
    const resConditionPct = document.getElementById('resConditionPct');

    // Outputs
    const resDeliveryMonth = document.getElementById('resDeliveryMonth');
    const deliveryProgress = document.getElementById('deliveryProgress');
    const resDeliveryConditionAmt = document.getElementById('resDeliveryConditionAmt');
    const resPaidAtDelivery = document.getElementById('resPaidAtDelivery');
    const resRemainingDebt = document.getElementById('resRemainingDebt');
    const warningMessage = document.getElementById('warningMessage');

    const extendedResults = document.getElementById('extendedResults');
    const resOrgFee = document.getElementById('resOrgFee');
    const resTotalPayment = document.getElementById('resTotalPayment');
    const resRemainingMonths = document.getElementById('resRemainingMonths');
    const resTotalCost = document.getElementById('resTotalCost');

    // Toggles
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedSettings = document.getElementById('advancedSettings');

    // ── Yardımcı Fonksiyonlar ──
    const parseFormattedNumber = (str) => {
        if (!str) return 0;
        return parseInt(str.replace(/\./g, '')) || 0;
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('tr-TR').format(num);
    };

    const getDeliveryDateString = (monthsToAdd, startDateString) => {
        if (!startDateString) return '';
        const date = new Date(startDateString);
        date.setMonth(date.getMonth() + (monthsToAdd - 1));

        const monthNames = [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
        ];

        const day = date.getDate().toString().padStart(2, '0');
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    };

    // ── Girdi Olayları ──
    const handleNumberInput = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val) {
            e.target.value = formatNumber(parseInt(val));
        } else {
            e.target.value = '';
        }
        calculate();
    };

    targetAmountInput.addEventListener('input', (e) => {
        monthlyPaymentInput.value = '';
        handleNumberInput(e);
    });
    monthlyPaymentInput.addEventListener('input', handleNumberInput);
    startMonthInput.addEventListener('change', calculate);
    startMonthInput.addEventListener('input', calculate);

    // Hızlı Tutar Butonları
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            targetAmountInput.value = formatNumber(parseInt(btn.dataset.val));
            monthlyPaymentInput.value = '';
            calculate();
        });
    });
    // ── PDF İndirme ──
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    downloadPdfBtn.addEventListener('click', () => {
        const T = parseFormattedNumber(targetAmountInput.value);
        const A = parseFormattedNumber(monthlyPaymentInput.value);
        if (T <= 0 || A <= 0) {
            alert('Lütfen önce bir plan seçin.');
            return;
        }

        const pdfContent = document.createElement('div');
        pdfContent.style.fontFamily = 'Inter, sans-serif';
        pdfContent.style.color = '#111827';
        pdfContent.style.width = '750px';
        pdfContent.style.padding = '30px';
        pdfContent.style.backgroundColor = '#fff';

        // ═══ SAYFA 1: Başlık + Plan Önerileri ═══
        // Başlık
        const header = document.createElement('div');
        header.style.marginBottom = '20px';
        header.innerHTML = `
            <h1 style="color: #059669; text-align: center; margin: 0 0 5px; font-size: 22px;">Kaya</h1>
            <p style="text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 15px;">Faizsiz Finansman Hesaplayıcı — ${new Date().toLocaleDateString('tr-TR')}</p>
            <div style="display: flex; gap: 15px; background: #f3f4f6; padding: 10px 15px; border-radius: 8px; font-size: 13px;">
                <div><b>Hedef Tutar:</b> ₺${formatNumber(T)}</div>
                <div><b>Başlangıç:</b> ${startMonthInput.value ? new Date(startMonthInput.value).toLocaleDateString('tr-TR') : '-'}</div>
                <div><b>Aylık Ödeme:</b> ₺${formatNumber(A)}</div>
            </div>
        `;
        pdfContent.appendChild(header);

        // Plan Önerileri Tablosu
        const plansTitle = document.createElement('h3');
        plansTitle.style.cssText = 'font-size: 14px; color: #059669; margin: 0 0 8px; padding-bottom: 5px; border-bottom: 2px solid #10b981;';
        plansTitle.textContent = 'Ödeme Plan Önerileri';
        pdfContent.appendChild(plansTitle);

        const plansTableClone = document.querySelector('.plans-table').cloneNode(true);
        plansTableClone.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 11px;';
        plansTableClone.querySelectorAll('th').forEach(th => {
            th.style.cssText = 'padding: 6px 8px; background: #d1fae5; color: #059669; font-weight: 600; text-align: left; border-bottom: 2px solid #10b981; font-size: 10px;';
        });
        plansTableClone.querySelectorAll('td').forEach(td => {
            td.style.cssText = 'padding: 4px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px;';
        });
        // "Seç" butonlarını kaldır
        plansTableClone.querySelectorAll('.plan-select-btn').forEach(btn => btn.parentElement.remove());
        plansTableClone.querySelectorAll('th:last-child').forEach(th => th.remove());
        pdfContent.appendChild(plansTableClone);

        const spacer = document.createElement('div');
        spacer.style.cssText = 'height: 80px; border-bottom: 2px solid #10b981; margin-bottom: 20px;';
        pdfContent.appendChild(spacer);

        const page2Title = document.createElement('h1');
        page2Title.style.cssText = 'color: #059669; text-align: center; margin: 0 0 15px; font-size: 22px;';
        page2Title.textContent = 'Tasarruf Planı Detayı';
        pdfContent.appendChild(page2Title);

        // Özet Kartları
        const summarySection = document.querySelector('.summary-section');
        const summaryClone = summarySection.cloneNode(true);
        summaryClone.style.cssText = 'margin-bottom: 20px;';

        summaryClone.querySelectorAll('.summary-card').forEach(card => {
            card.style.cssText = 'padding: 8px 12px; margin-bottom: 6px; border-radius: 8px; border: 1px solid #e5e7eb;';
        });
        summaryClone.querySelectorAll('.summary-card.highlight').forEach(card => {
            card.style.cssText = 'padding: 10px 15px; margin-bottom: 8px; border-radius: 8px; background: #10b981; color: white;';
        });
        summaryClone.querySelectorAll('.summary-card.highlight .summary-label').forEach(el => {
            el.style.color = 'rgba(255,255,255,0.85)';
        });
        summaryClone.querySelectorAll('.summary-card.highlight .summary-value').forEach(el => {
            el.style.color = 'white';
        });
        summaryClone.querySelectorAll('.summary-row').forEach(row => {
            row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 6px;';
            row.querySelectorAll('.summary-card').forEach(c => { c.style.flex = '1'; });
        });
        summaryClone.querySelectorAll('.summary-label').forEach(el => {
            el.style.fontSize = '11px';
        });
        summaryClone.querySelectorAll('.summary-value').forEach(el => {
            el.style.fontSize = '15px';
            el.style.fontWeight = '700';
        });
        // Ödeme planı bölümünü özetden çıkar (ayrı ekleyeceğiz)
        const ppInSummary = summaryClone.querySelector('.payment-plan-section');
        if (ppInSummary) ppInSummary.remove();

        pdfContent.appendChild(summaryClone);

        // Ödeme Planı Tablosu
        const ppTitle = document.createElement('h3');
        ppTitle.style.cssText = 'font-size: 14px; color: #059669; margin: 0 0 8px; padding-bottom: 5px; border-bottom: 2px solid #10b981;';
        ppTitle.textContent = '📄 Aylık Ödeme Planı';
        pdfContent.appendChild(ppTitle);

        const ppTable = document.querySelector('.payment-plan-table');
        if (ppTable) {
            const ppClone = ppTable.cloneNode(true);
            ppClone.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 10px;';
            ppClone.querySelectorAll('th').forEach(th => {
                th.style.cssText = 'padding: 5px 6px; background: #d1fae5; color: #059669; font-weight: 600; text-align: left; border-bottom: 2px solid #10b981; font-size: 9px;';
            });
            ppClone.querySelectorAll('td').forEach(td => {
                td.style.cssText = 'padding: 3px 6px; border-bottom: 1px solid #e5e7eb; font-size: 10px;';
            });
            ppClone.querySelectorAll('.delivery-row').forEach(row => {
                row.style.cssText = 'background: #10b981;';
                row.querySelectorAll('td').forEach(td => {
                    td.style.cssText = 'padding: 3px 6px; border-bottom: 1px solid rgba(255,255,255,0.3); font-size: 10px; color: white; font-weight: 700;';
                });
            });
            pdfContent.appendChild(ppClone);
        }

        const opt = {
            margin: [10, 10, 10, 10],
            filename: 'tasarruf_plani.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, width: 750 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css' }
        };

        html2pdf().set(opt).from(pdfContent).save();
    });

    // Gelişmiş Ayarlar
    deliveryConditionInput.addEventListener('input', (e) => {
        deliveryConditionLabel.textContent = `%${e.target.value}`;
        resConditionPct.textContent = `%${e.target.value}`;
        calculate();
    });

    orgFeeInput.addEventListener('input', (e) => {
        orgFeeLabel.textContent = `%${e.target.value}`;
        calculate();
    });

    advancedToggle.addEventListener('click', () => {
        const isHidden = advancedSettings.style.display === 'none';
        advancedSettings.style.display = isHidden ? 'block' : 'none';
    });

    // ── Plan Önerileri Tablosu ──
    function generateSuggestionsTable() {
        const tbody = document.getElementById('suggestionsTableBody');
        if (!tbody) return;

        const T = parseFormattedNumber(targetAmountInput.value) || 1000000;
        const p = parseInt(deliveryConditionInput.value) / 100;

        tbody.innerHTML = '';

        const plansTemp = [];

        for (let targetMonths = 1; targetMonths <= 20; targetMonths++) {
            let totalTerm = Math.floor(targetMonths / p);
            if (totalTerm < targetMonths) totalTerm = targetMonths;

            const suggestedA = Math.ceil(T / totalTerm);
            const ratioVal = (targetMonths / totalTerm) * 100;
            const ratioPct = ratioVal.toFixed(1);

            plansTemp.push({ targetMonths, totalTerm, suggestedA, ratioVal, ratioPct });
        }

        plansTemp.sort((a, b) => a.targetMonths - b.targetMonths);

        plansTemp.forEach((plan) => {
            let bgColor;
            const r = parseFloat(plan.ratioPct);

            if (r === 40.0) {
                bgColor = 'hsl(140, 70%, 40%)';
            } else if (r > 40.0 && r <= 40.5) {
                bgColor = 'hsl(100, 70%, 45%)';
            } else if (r > 40.5 && r <= 41.0) {
                bgColor = 'hsl(60, 80%, 45%)';
            } else if (r > 41.0 && r <= 42.0) {
                bgColor = 'hsl(30, 80%, 50%)';
            } else {
                bgColor = 'hsl(0, 70%, 50%)';
            }

            const tr = document.createElement('tr');

            const dateStr = getDeliveryDateString(plan.targetMonths, startMonthInput.value);
            const termDateStr = getDeliveryDateString(plan.totalTerm, startMonthInput.value);

            tr.innerHTML = `
                <td style="font-weight: 600;">₺${formatNumber(plan.suggestedA)}</td>
                <td>${plan.targetMonths}. Ay<span class="date-sub">${dateStr}</span></td>
                <td>${plan.totalTerm} Ay<span class="date-sub">${termDateStr}</span></td>
                <td><span class="ratio-badge" style="background-color: ${bgColor};">%${plan.ratioPct}</span></td>
                <td><button class="plan-select-btn">Seç</button></td>
            `;

            const btn = tr.querySelector('.plan-select-btn');
            btn.addEventListener('click', () => {
                monthlyPaymentInput.value = formatNumber(plan.suggestedA);
                calculate();
            });

            tbody.appendChild(tr);
        });
    }

    // ── Detaylı Ödeme Planı ──
    function generatePaymentPlanTable(T, A, N, V) {
        const tbody = document.getElementById('paymentPlanBody');
        const section = document.getElementById('paymentPlanSection');
        if (!tbody || !section) return;

        if (T <= 0 || A <= 0 || V <= 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        tbody.innerHTML = '';

        let currentBalance = T;
        let totalPaid = 0;

        for (let i = 1; i <= V; i++) {
            const tr = document.createElement('tr');
            const dateStr = getDeliveryDateString(i, startMonthInput.value);

            totalPaid += A;
            currentBalance -= A;
            if (currentBalance < 0) currentBalance = 0;

            const isDelivery = (i === N);

            if (isDelivery) tr.classList.add('delivery-row');
            if (i % 2 === 0 && !isDelivery) tr.classList.add('even-row');

            tr.innerHTML = `
                <td class="col-no">${i}</td>
                <td class="col-date">${dateStr}</td>
                <td class="col-amount">₺${formatNumber(A)}</td>
                <td class="col-cumulative">₺${formatNumber(totalPaid)}</td>
                <td class="col-remaining">₺${formatNumber(currentBalance)}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    // ── Ana Hesaplama ──
    function calculate() {
        const T = parseFormattedNumber(targetAmountInput.value);
        const A = parseFormattedNumber(monthlyPaymentInput.value);
        const p = parseInt(deliveryConditionInput.value) / 100;
        const orgFeePct = parseInt(orgFeeInput.value) / 100;

        let V = 0;
        if (T > 0 && A > 0) {
            V = Math.ceil(T / A);
            totalTermInput.value = `${V} Ay`;
        } else {
            totalTermInput.value = '';
        }

        const threshold = T * p;

        if (T <= 0 || A <= 0 || !A) {
            resetResults();
            generateSuggestionsTable();
            return;
        }

        const N = Math.ceil(threshold / A);
        warningMessage.style.display = 'none';

        const paidAtDelivery = N * A;
        const remainingDebt = Math.max(0, T - paidAtDelivery);

        let progress = 0;
        if (N > 0 && V > 0 && N <= V) {
            progress = (N / V) * 100;
        } else {
            progress = 100;
        }

        // Sonuçları göster
        if (N > 0) {
            const dateStr = getDeliveryDateString(N, startMonthInput.value);

            if (V > 0) {
                const termDateStr = getDeliveryDateString(V, startMonthInput.value);
                resDeliveryMonth.innerHTML = `${N}. Ay<br><span style="font-size: 0.8em; opacity: 0.85;">(${dateStr})</span><br><span style="font-size: 0.7em; opacity: 0.75;">Son Vade: ${V} Ay — ${termDateStr}</span>`;
            } else {
                resDeliveryMonth.innerHTML = `${N}. Ay<br><span style="font-size: 0.8em; opacity: 0.85;">(${dateStr})</span>`;
            }
        } else {
            resDeliveryMonth.textContent = '-';
        }

        deliveryProgress.style.width = V > 0 ? `${progress}%` : '100%';
        resDeliveryConditionAmt.textContent = `₺${formatNumber(threshold)}`;
        resPaidAtDelivery.textContent = `₺${formatNumber(paidAtDelivery)}`;
        resRemainingDebt.textContent = `₺${formatNumber(remainingDebt)}`;

        const remainingMonths = Math.max(0, V - N);
        resRemainingMonths.textContent = V > 0 ? `${remainingMonths} Ay` : '-';

        // Gelişmiş sonuçlar
        if (V > 0 || orgFeePct > 0) {
            extendedResults.style.display = 'flex';

            const orgFee = T * orgFeePct;
            resOrgFee.textContent = `₺${formatNumber(orgFee)}`;

            if (V > 0) {
                const totalPaymentBase = T;
                const totalCost = totalPaymentBase + orgFee;
                resTotalPayment.textContent = `₺${formatNumber(totalPaymentBase)}`;
                resTotalCost.textContent = `₺${formatNumber(totalCost)}`;
            } else {
                resTotalPayment.textContent = '-';
                resTotalCost.textContent = `₺${formatNumber(T + orgFee)}`;
            }
        } else {
            extendedResults.style.display = 'none';
        }

        generateSuggestionsTable();
        generatePaymentPlanTable(T, A, N, V);
    }

    function resetResults() {
        resDeliveryMonth.textContent = '-';
        resDeliveryConditionAmt.textContent = '₺0';
        resPaidAtDelivery.textContent = '₺0';
        resRemainingDebt.textContent = '₺0';
        extendedResults.style.display = 'none';
        warningMessage.style.display = 'none';

        const paymentSection = document.getElementById('paymentPlanSection');
        if (paymentSection) paymentSection.style.display = 'none';
    }

    // İlk hesaplama
    calculate();
});
