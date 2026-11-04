import { NextResponse } from "next/server"

export async function GET() {
  const csvContent = `Category,Item Name,Variation / Weight,Selling Price (₹),MRP / Original Price (₹),Food Type (Veg/Non-Veg),Available (YES/NO)
Cakes,Chocolate Truffle Cake,500g,450,500,Veg,YES
Cakes,Chocolate Truffle Cake,1kg,850,950,Veg,YES
Cakes,Red Velvet Fresh Cake,500g,500,550,Veg,YES
Cakes,Pineapple Fresh Cream Cake,500g,350,400,Veg,YES
Cakes,Pineapple Fresh Cream Cake,1kg,650,750,Veg,YES
Pastries,Black Forest Pastry,1 Pc,70,80,Veg,YES
Pastries,Dutch Truffle Pastry,1 Pc,90,100,Veg,YES
Dry Snacks,Almond Crunch Cookies,250g Box,180,200,Veg,YES
Beverages,Cold Coffee with Ice Cream,Regular Glass,120,140,Veg,YES
`
  return new NextResponse("\uFEFF" + csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="CustomerPilot_Menu_Import_Template.csv"',
      "Cache-Control": "no-cache",
    },
  })
}
