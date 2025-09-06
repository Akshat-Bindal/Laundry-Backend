import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export async function generateInvoicePDF(order, populatedUser) {
  const templateBytes = fs.readFileSync("templates/invoiceTemplate.pdf");
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header
  page.drawText(order._id.toString().slice(-6), { x: 420, y: 740, size: 12, font });
  page.drawText(new Date(order.createdAt).toLocaleDateString(), { x: 420, y: 720, size: 12, font });

  // Customer
  page.drawText(populatedUser.name, { x: 70, y: 740, size: 12, font });
  page.drawText(populatedUser.addresses?.[0] || "-", { x: 70, y: 725, size: 12, font });
  page.drawText(populatedUser.phone, { x: 70, y: 710, size: 12, font });

  // Services
  let startY = 670;
  order.items.forEach((item, idx) => {
    const y = startY - idx * 20;
    page.drawText(item.serviceName, { x: 70, y, size: 12, font });
    page.drawText(item.quantity.toString(), { x: 300, y, size: 12, font });
    page.drawText(item.price.toFixed(2), { x: 360, y, size: 12, font });
    page.drawText((item.quantity * item.price).toFixed(2), { x: 450, y, size: 12, font });
  });

  // Summary
  page.drawText(order.subtotal.toFixed(2), { x: 400, y: 200, size: 12, font });
  page.drawText(order.urgencyCharge.toFixed(2), { x: 400, y: 180, size: 12, font });
  page.drawText(order.total.toFixed(2), { x: 400, y: 160, size: 12, font });

  // Save & upload
  const pdfBytes = await pdfDoc.save();
  const tempPath = `./invoice-${order._id}.pdf`;
  fs.writeFileSync(tempPath, pdfBytes);

  const result = await cloudinary.uploader.upload(tempPath, {
    folder: "invoices",
    resource_type: "auto",
  });

  fs.unlinkSync(tempPath); // cleanup
  return result.secure_url;
}
