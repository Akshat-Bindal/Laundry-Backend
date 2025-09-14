import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export async function generateInvoicePDF(order, populatedUser) {
  const templateBytes = fs.readFileSync("templates/Washing tons.pdf");
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText(order._id.toString().slice(-8), { x: 110, y: 710, size: 13, boldFont });
  page.drawText(new Date(order.createdAt).toLocaleDateString(), { x: 430, y: 690, size: 13, font });

  // Customer
  page.drawText(populatedUser.name, { x: 35, y: 660, size: 14, font });
  page.drawText(order.shippingAddress || order.user.addresses?.[0] || "-", { x: 35, y: 620, size: 14, font });
  page.drawText(populatedUser.phone, { x: 35, y: 640, size: 14, font });

  // Services
  let startY = 520;
  order.items.forEach((item, idx) => {
    let lineTotal = item.price;
    if (item.quantity != null) {
      lineTotal *= item.quantity;
    }
    if (item.weightKg != null) {
      lineTotal *= item.weightKg;
    }
    const y = startY - idx * 20;
    page.drawText(item.serviceName, { x: 60, y, size: 12, font });
    page.drawText(item.weightKg?.toString() || "-", { x: 230, y, size: 12, font });
    page.drawText(item.quantity.toString(), { x: 300, y, size: 12, font });
    page.drawText(item.price.toFixed(2), { x: 370, y, size: 12, font });
    page.drawText(lineTotal.toFixed(2), { x: 470, y, size: 12, font });
  });

  // Summary
  page.drawText(order.subtotal.toFixed(2), { x: 450, y: 180, size: 14, font });
  page.drawText(order.urgencyCharge.toFixed(2), { x: 460, y: 133, size: 14, font });
  page.drawText(order.total.toFixed(2), { x: 450, y: 80, size: 14, font });

  // Save & upload
  const pdfBytes = await pdfDoc.save();
  const tempPath = `./invoice-${order._id}.pdf`;
  fs.writeFileSync(tempPath, pdfBytes);

  const result = await cloudinary.uploader.upload(tempPath, {
    folder: "invoices",
    resource_type: "auto",
  });

  fs.unlinkSync(tempPath); 
  return result.secure_url;
}
