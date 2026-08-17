import { Request, Response } from 'express';
import { ReportEngine } from '../services/reportEngine.js';
import { BIExportEngine } from '../services/biExportEngine.js';

const reportEngine = ReportEngine.getInstance();
const biExportEngine = BIExportEngine.getInstance();

export async function getReports(req: Request, res: Response) {
  try {
    const reports = await reportEngine.getReports();
    return res.json(reports);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await reportEngine.getReportById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function generateReport(req: Request, res: Response) {
  try {
    const report = await reportEngine.generateReport(req.body);
    return res.status(201).json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getReportSnapshot(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const snapshot = await reportEngine.getSnapshotById(id);
    if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });
    return res.json(snapshot);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getBiDatasetsList(req: Request, res: Response) {
  try {
    const datasets = await biExportEngine.getAllDatasetsList();
    return res.json(datasets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function exportBiDataset(req: Request, res: Response) {
  try {
    const { datasetCode } = req.params;
    const result = await biExportEngine.generateDataset(datasetCode);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Checksum-SHA256', result.checksum);
    res.setHeader('X-Record-Count', result.count.toString());

    return res.send(result.csvContent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
