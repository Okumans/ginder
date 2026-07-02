import { Restaurant } from "./types";

const mockRestaurants: Restaurant[] = [
  // ─── อีสาน (4) ───
  {
    id: "r1",
    name: "ส้มตำเจ๊แดง",
    cuisine: "อีสาน",
    priceRange: "$",
    tags: ["ส้มตำ", "ไก่ย่าง", "ข้าวเหนียว"],
    description: "ส้มตำรสแซ่บ ตำไทย ตำปูปลาร้า ครบเครื่องเรื่องอีสาน ไก่ย่างหนังกรอบเนื้อนุ่ม",
    imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop",
  },
  {
    id: "r2",
    name: "ลาบเป็ดอุบล",
    cuisine: "อีสาน",
    priceRange: "$$",
    tags: ["ลาบ", "เป็ด", "สมุนไพร"],
    description: "ลาบเป็ดสูตรโบราณจากอุบลฯ ใช้เป็ดสด หอมข้าวคั่ว พริกป่นคั่วเอง",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
  },
  {
    id: "r3",
    name: "ซุปหน่อไม้",
    cuisine: "อีสาน",
    priceRange: "$",
    tags: ["ซุป", "หน่อไม้", "ย่านาง"],
    description: "ซุปหน่อไม้ใส่ใบย่านาง น้ำต้มกระดูกหมู ใส่ข้าวเบือ ให้รสเข้มข้นแบบอีสานแท้",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  },
  {
    id: "r4",
    name: "หมกปลาช่อน",
    cuisine: "อีสาน",
    priceRange: "$$",
    tags: ["หมก", "ปลาช่อน", "ใบยอ"],
    description: "ปลาช่อนสดหมกสมุนไพร ใส่ตะไคร้ ใบยอ ห่อใบตองย่างเตาถ่าน หอมฟุ้ง",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  },

  // ─── ไทยภาคกลาง (4) ───
  {
    id: "r5",
    name: "ต้มยำกุ้งน้ำข้น",
    cuisine: "ไทยภาคกลาง",
    priceRange: "$$$",
    tags: ["ต้มยำ", "กุ้งแม่น้ำ", "เผ็ด"],
    description: "ต้มยำกุ้งแม่น้ำตัวโต น้ำข้นมันกุ้ง รสเปรี้ยวเผ็ดลงตัว ตำนานครัวไทย",
    imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&h=400&fit=crop",
  },
  {
    id: "r6",
    name: "ผัดไทยกุ้งสด",
    cuisine: "ไทยภาคกลาง",
    priceRange: "$",
    tags: ["ผัดไทย", "เส้นจัน", "กุ้งสด"],
    description: "ผัดไทยสูตรโบราณ เส้นจันทร์เหนียวนุ่ม กุ้งสดตัวใหญ่ ใส่ซอสมะขามเปรี้ยวกลมกล่อม",
    imageUrl: "https://images.unsplash.com/photo-1559314809-8e5b3e80f80a?w=600&h=400&fit=crop",
  },
  {
    id: "r7",
    name: "แกงเขียวหวานไก่",
    cuisine: "ไทยภาคกลาง",
    priceRange: "$$",
    tags: ["แกงเขียวหวาน", "ไก่", "กะทิ"],
    description: "แกงเขียวหวานหอมพริกแกงสด มะเขือเปราะ ใบโหระพา ไก่เนื้อนุ่ม กะทิหอมมัน",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70f6?w=600&h=400&fit=crop",
  },
  {
    id: "r8",
    name: "ข้าวผัดปู",
    cuisine: "ไทยภาคกลาง",
    priceRange: "$$$",
    tags: ["ข้าวผัด", "ปู", "ไข่"],
    description: "ข้าวผัดปูเนื้อปูล้วนๆ ไข่ดาวกรอบฟู ปรุงรสกลมกล่อม เสิร์ฟพร้อมน้ำพริกเผา",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop",
  },

  // ─── ญี่ปุ่น (3) ───
  {
    id: "r9",
    name: "ราเมนมิโซะ",
    cuisine: "ญี่ปุ่น",
    priceRange: "$$",
    tags: ["ราเมน", "มิโซะ", "หมูชาชู"],
    description: "ราเมนซุปมิโซะเข้มข้น เส้นเหนียวนุ่มทำสด หมูชาชูตุ๋นนิ่ม ไข่ต้มยางมะตูม",
    imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop",
  },
  {
    id: "r10",
    name: "ซูชิแซลมอน",
    cuisine: "ญี่ปุ่น",
    priceRange: "$$$",
    tags: ["ซูชิ", "แซลมอน", "ซาซิมิ"],
    description: "ซูชิแซลมอนนำเข้าสดใหม่ ข้าวซูชิปรุงรสพอดี เนื้อปลาเงางาม ชิ้นโตเต็มคำ",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
  },
  {
    id: "r11",
    name: "ข้าวหน้าแกงกะหรี่",
    cuisine: "ญี่ปุ่น",
    priceRange: "$",
    tags: ["แกงกะหรี่", "หมูทอด", "ข้าว"],
    description: "แกงกะหรี่ญี่ปุ่นรสกลมกล่อม หมูทอดทงคัตสึกรอบนอกนุ่มใน น้ำแกงข้นหอมเครื่องเทศ",
    imageUrl: "https://images.unsplash.com/photo-1590593162201-f67611a18b87?w=600&h=400&fit=crop",
  },

  // ─── เกาหลี (3) ───
  {
    id: "r12",
    name: "หมูย่างเกาหลี",
    cuisine: "เกาหลี",
    priceRange: "$$$",
    tags: ["หมูย่าง", "ซัมกยอบซัล", "กิมจิ"],
    description: "หมูสามชั้นหมักซอสโคชูจัง ย่างบนเตาถ่าน กินคู่กับกิมจิและผักสดหลากหลาย",
    imageUrl: "https://images.unsplash.com/photo-1593253787226-567eda4ad32d?w=600&h=400&fit=crop",
  },
  {
    id: "r13",
    name: "ต๊อกปกกี",
    cuisine: "เกาหลี",
    priceRange: "$",
    tags: ["ต๊อกปกกี", "สตรีทฟู้ด", "เผ็ด"],
    description: "ต๊อกปกกีซอสเผ็ดหวาน ใส่แป้งต๊อกนุ่มเด้ง ลูกชิ้นปลา และไข่ต้ม ซอสข้นติดใจ",
    imageUrl: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=600&h=400&fit=crop",
  },
  {
    id: "r14",
    name: "ข้าวผัดกิมจิ",
    cuisine: "เกาหลี",
    priceRange: "$",
    tags: ["ข้าวผัด", "กิมจิ", "หมู"],
    description: "ข้าวผัดกิมจิหอมกระทะ ใส่หมูสามชั้นสไลด์ ไข่ดาวกรอบ กิมจิเปรี้ยวกำลังดี",
    imageUrl: "https://images.unsplash.com/photo-1696955372159-7c75402b4e2e?w=600&h=400&fit=crop",
  },

  // ─── จีน (3) ───
  {
    id: "r15",
    name: "ติ่มซำฮะเก๋า",
    cuisine: "จีน",
    priceRange: "$$",
    tags: ["ติ่มซำ", "กุ้ง", "นึ่ง"],
    description: "ฮะเก๋าแป้งบางใส กุ้งเด้งเต็มปาก นึ่งร้อนๆ จิ้มซีอิ๊วหวาน ทำสดทุกคำสั่ง",
    imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=400&fit=crop",
  },
  {
    id: "r16",
    name: "เป็ดปักกิ่ง",
    cuisine: "จีน",
    priceRange: "$$$",
    tags: ["เป็ดปักกิ่ง", "หนังกรอบ", "แป้งห่อ"],
    description: "เป็ดย่างหนังกรอบ แล่เนื้อบางเสิร์ฟพร้อมแป้งห่อ ต้นหอม แตงกวา และซอสฮอยซิน",
    imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop",
  },
  {
    id: "r17",
    name: "ข้าวผัดซี่โครงหมู",
    cuisine: "จีน",
    priceRange: "$$",
    tags: ["ข้าวผัด", "ซี่โครง", "กระเทียม"],
    description: "ข้าวผัดกระทะร้อน ซี่โครงหมูหมักซอสเนื้อนุ่ม ใส่กระเทียมเจียวหอมกรอบ",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop",
  },

  // ─── อิตาเลียน (3) ───
  {
    id: "r18",
    name: "พิซซ่ามาร์เกอรีต้า",
    cuisine: "อิตาเลียน",
    priceRange: "$$",
    tags: ["พิซซ่า", "มอซซาเรลล่า", "ซอสมะเขือเทศ"],
    description: "พิซซ่าเตาฟืนแป้งบางกรอบ ใช้มอซซาเรลล่าสด ซอสมะเขือเทศซานมาร์ซาโน่ ใบโหระพาสด",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
  },
  {
    id: "r19",
    name: "พาสต้าอัลลิโอโอลิโอ",
    cuisine: "อิตาเลียน",
    priceRange: "$",
    tags: ["พาสต้า", "กระเทียม", "พริก"],
    description: "สปาเก็ตตี้ผัดน้ำมันมะกอก กระเทียมซอย พริกป่น พาร์สลีย์หอม เรียบง่ายแต่อร่อยลึก",
    imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&h=400&fit=crop",
  },
  {
    id: "r20",
    name: "รีซอตโตเห็ดทรัฟเฟิล",
    cuisine: "อิตาเลียน",
    priceRange: "$$$",
    tags: ["รีซอตโต", "เห็ด", "ทรัฟเฟิล"],
    description: "ข้าวอิตาเลียนอาร์โบริโอหุงกับน้ำสต็อกเห็ด ใส่พาร์มีซานและน้ำมันทรัฟเฟิลดำ",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop",
  },

  // ─── สตรีทฟู้ด (3) ───
  {
    id: "r21",
    name: "ก๋วยเตี๋ยวเรือ",
    cuisine: "สตรีทฟู้ด",
    priceRange: "$",
    tags: ["ก๋วยเตี๋ยว", "น้ำตก", "หมูตุ๋น"],
    description: "ก๋วยเตี๋ยวเรือน้ำข้นเข้ม เติมเลือดหมูสด หมูตุ๋นเปื่อยนุ่ม เครื่องในกรุบกรอบ",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
  },
  {
    id: "r22",
    name: "ไก่ทอดหาดใหญ่",
    cuisine: "สตรีทฟู้ด",
    priceRange: "$",
    tags: ["ไก่ทอด", "ข้าวเหนียว", "หาดใหญ่"],
    description: "ไก่ทอดหาดใหญ่หมักเครื่องเทศ หอมพริกไทยกระเทียม ทอดกรอบไม่อมน้ำมัน จิ้มซอสหวาน",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop",
  },
  {
    id: "r23",
    name: "ลูกชิ้นปิ้ง",
    cuisine: "สตรีทฟู้ด",
    priceRange: "$",
    tags: ["ลูกชิ้น", "ปิ้ง", "น้ำจิ้ม"],
    description: "ลูกชิ้นเนื้อวัวปิ้งเตาถ่าน เนื้อเด้งแน่น น้ำจิ้มรสเด็ดเผ็ดหวาน ไม้ละ 5 บาท",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
  },

  // ─── ของหวาน (2) ───
  {
    id: "r24",
    name: "บัวลอยไข่หวาน",
    cuisine: "ของหวาน",
    priceRange: "$",
    tags: ["บัวลอย", "กะทิ", "ไข่หวาน"],
    description: "บัวลอยแป้งนุ่มหลากสี น้ำกะทิหอมมัน ใส่ไข่หวานเยิ้มมะพร้าวอ่อน อุ่นๆ ทานแล้วฟิน",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=400&fit=crop",
  },
  {
    id: "r25",
    name: "ทับทิมกรอบ",
    cuisine: "ของหวาน",
    priceRange: "$",
    tags: ["ทับทิมกรอบ", "กะทิ", "น้ำแข็งใส"],
    description: "แห้วในแป้งมันสีแดงกรอบนอกนุ่มใน ราดน้ำกะทิหอมหวานเย็นชื่นใจ ใส่น้ำแข็งป่นละเอียด",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop",
  },

  // ─── ชาบู/ปิ้งย่าง (2) ───
  {
    id: "r26",
    name: "ชาบูหมูดำ",
    cuisine: "ชาบู/ปิ้งย่าง",
    priceRange: "$$$",
    tags: ["ชาบู", "หมูดำ", "น้ำซุป"],
    description: "ชาบูหมูดำคุโรบูตะสไลด์บาง เนื้อนุ่มละลายในปาก น้ำซุปสาหร่ายเข้มข้น จิ้มพอนซึรสเปรี้ยว",
    imageUrl: "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=600&h=400&fit=crop",
  },
  {
    id: "r27",
    name: "หมูกระทะ",
    cuisine: "ชาบู/ปิ้งย่าง",
    priceRange: "$$",
    tags: ["หมูกระทะ", "บุฟเฟต์", "ปิ้งย่าง"],
    description: "หมูกระทะสไตล์ไทย น้ำจิ้มรสเด็ด หมูหมักนุ่ม อาหารทะเลสด ผักแน่น กินได้ไม่อั้น",
    imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop",
  },

  // ─── ซีฟู้ด (3) ───
  {
    id: "r28",
    name: "ปูผัดผงกะหรี่",
    cuisine: "ซีฟู้ด",
    priceRange: "$$$",
    tags: ["ปู", "ผัดผงกะหรี่", "ไข่"],
    description: "ปูม้าตัวโตผัดผงกะหรี่หอมมัน ใส่ไข่ข้น เนื้อปูหวานสด เสิร์ฟพร้อมต้นหอมและพริกชี้ฟ้า",
    imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop",
  },
  {
    id: "r29",
    name: "ปลากะพงนึ่งมะนาว",
    cuisine: "ซีฟู้ด",
    priceRange: "$$$",
    tags: ["ปลากะพง", "นึ่ง", "มะนาว"],
    description: "ปลากะพงสดนึ่งไฟแรง ราดน้ำมะนาวพริกขี้หนูสวน กระเทียมซอย หอมสดชื่น รสเปรี้ยวเผ็ด",
    imageUrl: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&h=400&fit=crop",
  },
  {
    id: "r30",
    name: "หอยนางรมสด",
    cuisine: "ซีฟู้ด",
    priceRange: "$$$",
    tags: ["หอยนางรม", "สด", "น้ำจิ้มซีฟู้ด"],
    description: "หอยนางรมนำเข้าตัวอวบ สดแกะต่อหน้า จิ้มน้ำจิ้มซีฟู้ดรสแซ่บ หรือซอสพริกเผา",
    imageUrl: "https://images.unsplash.com/photo-1597692529736-d5b7f2e40e07?w=600&h=400&fit=crop",
  },
];

export default mockRestaurants;

export function getRestaurantById(id: string): Restaurant | undefined {
  return mockRestaurants.find((r) => r.id === id);
}

export function getRestaurantsByIds(ids: string[]): Restaurant[] {
  const lookup = new Map(mockRestaurants.map((r) => [r.id, r]));
  return ids.map((id) => lookup.get(id)).filter(Boolean) as Restaurant[];
}