const gstReportService = require('../services/gstReportService');
const financialReportService = require('../services/financialReportService');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const generateExcel = async (res, title, data, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = columns;
    
    // Add data
    if (Array.isArray(data)) {
        worksheet.addRows(data);
    } else {
        // If data is an object of key-values, just convert to rows
        Object.keys(data).forEach(k => {
            if (typeof data[k] !== 'object') {
                worksheet.addRow([k, data[k]]);
            }
        });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${title}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

const generatePdf = (res, title, data) => {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    if (!Array.isArray(data)) {
        Object.keys(data).forEach(key => {
            if (typeof data[key] !== 'object') {
                doc.text(`${key}: ${data[key]}`);
            } else {
                doc.text(`${key}: [Nested Data Omitted for PDF brevity]`);
            }
            doc.moveDown(0.5);
        });
    } else {
        doc.text(JSON.stringify(data, null, 2));
    }

    doc.end();
};

exports.getSalesSummary = async (req, res) => {
    try {
        const { startDate, endDate, export_type } = req.query;
        const data = await gstReportService.getSalesSummary(startDate, endDate);
        
        if (export_type === 'excel') {
            return generateExcel(res, 'Sales_Summary', data, [
                { header: 'Metric', key: '0', width: 30 },
                { header: 'Value', key: '1', width: 30 }
            ]);
        } else if (export_type === 'pdf') {
            return generatePdf(res, 'Sales Summary', data);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPurchaseSummary = async (req, res) => {
    try {
        const { startDate, endDate, export_type } = req.query;
        const data = await gstReportService.getPurchaseSummary(startDate, endDate);

        if (export_type === 'excel') return generateExcel(res, 'Purchase_Summary', data, [{header:'Metric'}, {header:'Value'}]);
        if (export_type === 'pdf') return generatePdf(res, 'Purchase Summary', data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGSTSummary = async (req, res) => {
    try {
        const { startDate, endDate, export_type } = req.query;
        const data = await gstReportService.getGSTSummary(startDate, endDate);

        if (export_type === 'excel') return generateExcel(res, 'GST_Summary', data, [{header:'Metric'}, {header:'Value'}]);
        if (export_type === 'pdf') return generatePdf(res, 'GST Summary', data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfitAndLoss = async (req, res) => {
    try {
        let { year, export_type } = req.query;
        if (!year) year = '2023-2024'; // Default
        const data = await financialReportService.getProfitAndLoss(year);

        if (export_type === 'excel') return generateExcel(res, 'Profit_And_Loss', data, [{header:'Metric'}, {header:'Value'}]);
        if (export_type === 'pdf') return generatePdf(res, 'Profit and Loss', data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getInventoryValuation = async (req, res) => {
    try {
        const { export_type } = req.query;
        const data = await financialReportService.getInventoryValuation();

        if (export_type === 'excel') return generateExcel(res, 'Inventory_Valuation', data, [{header:'Metric'}, {header:'Value'}]);
        if (export_type === 'pdf') return generatePdf(res, 'Inventory Valuation', data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFinancialYearSummary = async (req, res) => {
    try {
        let { year, export_type } = req.query;
        if (!year) year = '2023-2024';
        const data = await financialReportService.getFinancialYearSummary(year);

        if (export_type === 'excel') return generateExcel(res, 'FY_Summary', data, [{header:'Metric'}, {header:'Value'}]);
        if (export_type === 'pdf') return generatePdf(res, 'Financial Year Summary', data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
