import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface StoreSettings {
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  paymentDetails: {
    momoName: string;
    momoNumber: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  store: {
    name: string;
    tagline: string;
    location: string;
    currency: string;
  };
}

const DEFAULTS: StoreSettings = {
  contact: {
    email: "keilasstudioextensions@gmail.com",
    phone: "+233 XX XXX XXXX",
    whatsapp: "233XXXXXXXXX",
  },
  paymentDetails: {
    momoName: "Keila's Studio",
    momoNumber: "024XXXXXXX",
    bankName: "",
    accountNumber: "",
    accountName: "",
  },
  socials: {
    instagram: "@keilas_studio_extensions_",
    facebook: "",
    tiktok: "@keilas_studio_extensions_",
  },
  store: {
    name: "Keila's Studio Extensions",
    tagline: "Premium Hair Extensions · Accra, Ghana",
    location: "East Legon, Adjiringanor, Accra, Ghana",
    currency: "GHS",
  },
};

const DATA_FILE = path.join(process.cwd(), "data", "settings.json");

function readSettings(): StoreSettings {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULTS, null, 2));
    return DEFAULTS;
  }
  return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) };
}

// GET /api/settings
export async function GET() {
  return NextResponse.json(readSettings());
}

// PUT /api/settings
export async function PUT(req: NextRequest) {
  const body = await req.json() as Partial<StoreSettings>;
  const current = readSettings();
  const updated: StoreSettings = {
    contact: { ...current.contact, ...body.contact },
    paymentDetails: { ...current.paymentDetails, ...body.paymentDetails },
    socials: { ...current.socials, ...body.socials },
    store: { ...current.store, ...body.store },
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  return NextResponse.json(updated);
}
