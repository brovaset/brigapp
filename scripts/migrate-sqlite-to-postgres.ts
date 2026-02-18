#!/usr/bin/env tsx
/**
 * Migrates data from SQLite (old dev.db) to PostgreSQL.
 * Run: npm run db:migrate-from-sqlite
 *
 * Set SQLITE_PATH to override default (prisma/prisma/dev.db).
 * Requires DATABASE_URL for Postgres.
 */
import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import initSqlJs from 'sql.js'
import { PrismaClient } from '@prisma/client'

const SQLITE_PATH =
  process.env.SQLITE_PATH ||
  path.join(process.cwd(), 'prisma', 'prisma', 'dev.db')

const TABLES = [
  'User',
  'Listing',
  'BlockedDate',
  'SavedListing',
  'Booking',
  'Payment',
  'Payout',
  'Message',
  'Rating',
] as const

function toRow(columns: string[], values: unknown[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  columns.forEach((col, i) => {
    row[col] = values[i]
  })
  return row
}

function toBool(v: unknown): boolean {
  if (v === null || v === undefined) return false
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true'
  return false
}

function parseDate(v: unknown): Date {
  if (v == null) return new Date(0)
  const n = Number(v)
  if (!Number.isNaN(n)) return new Date(n)
  return new Date(String(v))
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || !dbUrl.startsWith('postgresql')) {
    console.error('DATABASE_URL must be a PostgreSQL connection string')
    process.exit(1)
  }

  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`SQLite file not found: ${SQLITE_PATH}`)
    console.error('Set SQLITE_PATH to your dev.db path if different.')
    process.exit(1)
  }

  console.log('Loading SQLite from', SQLITE_PATH)
  const fileBuffer = fs.readFileSync(SQLITE_PATH)
  const SQL = await initSqlJs()
  const sqlite = new SQL.Database(fileBuffer)

  const prisma = new PrismaClient()

  try {
    let total = 0
    for (const table of TABLES) {
      const result = sqlite.exec(`SELECT * FROM "${table}"`)
      if (!result.length || !result[0].values.length) {
        console.log(`  ${table}: 0 rows (skipped)`)
        continue
      }

      const { columns, values } = result[0]
      const rows = values.map((v) => toRow(columns, v))

      for (const row of rows) {
        try {
          switch (table) {
            case 'User':
              await prisma.user.create({
                data: {
                  id: String(row.id),
                  email: String(row.email),
                  password: row.password != null ? String(row.password) : null,
                  googleId: row.googleId != null ? String(row.googleId) : null,
                  firstName: String(row.firstName),
                  lastName: String(row.lastName),
                  phone: row.phone != null ? String(row.phone) : null,
                  role: String(row.role ?? 'BOTH'),
                  profileImageUrl:
                    row.profileImageUrl != null
                      ? String(row.profileImageUrl)
                      : null,
                  stripeAccountId:
                    row.stripeAccountId != null
                      ? String(row.stripeAccountId)
                      : null,
                },
              })
              break
            case 'Listing':
              await prisma.listing.create({
                data: {
                  id: String(row.id),
                  hostId: String(row.hostId),
                  title: String(row.title),
                  description: String(row.description),
                  address: String(row.address),
                  city: String(row.city),
                  state: String(row.state),
                  zipCode: String(row.zipCode),
                  latitude: Number(row.latitude),
                  longitude: Number(row.longitude),
                  pricePerHour: Number(row.pricePerHour),
                  pricePerDay: Number(row.pricePerDay),
                  maxVehicleSize:
                    row.maxVehicleSize != null
                      ? String(row.maxVehicleSize)
                      : null,
                  photos: String(row.photos),
                  entryInstructions:
                    row.entryInstructions != null
                      ? String(row.entryInstructions)
                      : null,
                  amenities:
                    row.amenities != null ? String(row.amenities) : null,
                  instantBook: toBool(row.instantBook),
                  cancellationPolicy: String(
                    row.cancellationPolicy ?? 'FLEXIBLE'
                  ),
                  houseRules:
                    row.houseRules != null ? String(row.houseRules) : null,
                  isActive: toBool(row.isActive ?? true),
                },
              })
              break
            case 'BlockedDate':
              await prisma.blockedDate.create({
                data: {
                  id: String(row.id),
                  listingId: String(row.listingId),
                  startDate: parseDate(row.startDate),
                  endDate: parseDate(row.endDate),
                  reason:
                    row.reason != null ? String(row.reason) : null,
                },
              })
              break
            case 'SavedListing':
              await prisma.savedListing.create({
                data: {
                  id: String(row.id),
                  userId: String(row.userId),
                  listingId: String(row.listingId),
                },
              })
              break
            case 'Booking':
              await prisma.booking.create({
                data: {
                  id: String(row.id),
                  driverId: String(row.driverId),
                  listingId: String(row.listingId),
                  hostId: String(row.hostId),
                  startTime: parseDate(row.startTime),
                  endTime: parseDate(row.endTime),
                  vehicleMake: String(row.vehicleMake),
                  vehicleModel: String(row.vehicleModel),
                  licensePlate: String(row.licensePlate),
                  licensePlateState:
                    row.licensePlateState != null
                      ? String(row.licensePlateState)
                      : null,
                  totalAmount: Number(row.totalAmount),
                  status: String(row.status ?? 'PENDING'),
                },
              })
              break
            case 'Payment':
              await prisma.payment.create({
                data: {
                  id: String(row.id),
                  bookingId: String(row.bookingId),
                  stripePaymentId: String(row.stripePaymentId),
                  amount: Number(row.amount),
                  status: String(row.status ?? 'PENDING'),
                },
              })
              break
            case 'Payout':
              await prisma.payout.create({
                data: {
                  id: String(row.id),
                  hostId: String(row.hostId),
                  amount: Number(row.amount),
                  stripeTransferId:
                    row.stripeTransferId != null
                      ? String(row.stripeTransferId)
                      : null,
                  status: String(row.status ?? 'PENDING'),
                },
              })
              break
            case 'Message':
              await prisma.message.create({
                data: {
                  id: String(row.id),
                  bookingId:
                    row.bookingId != null ? String(row.bookingId) : null,
                  listingId:
                    row.listingId != null ? String(row.listingId) : null,
                  senderId: String(row.senderId),
                  receiverId: String(row.receiverId),
                  content: String(row.content),
                  imageUrl:
                    row.imageUrl != null ? String(row.imageUrl) : null,
                  isRead: toBool(row.isRead),
                },
              })
              break
            case 'Rating':
              await prisma.rating.create({
                data: {
                  id: String(row.id),
                  bookingId: String(row.bookingId),
                  bookingHostId:
                    row.bookingHostId != null
                      ? String(row.bookingHostId)
                      : null,
                  driverId: String(row.driverId),
                  hostId: String(row.hostId),
                  listingId: String(row.listingId),
                  rating: Number(row.rating),
                  comment:
                    row.comment != null ? String(row.comment) : null,
                },
              })
              break
          }
          total++
        } catch (err) {
          const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : ''
          if (code === 'P2002') {
            // Unique constraint - already exists, skip
            continue
          }
          console.error(`  Error inserting ${table} row:`, err)
          throw err
        }
      }
      console.log(`  ${table}: ${rows.length} rows`)
    }

    console.log('\nMigration complete. Total rows migrated:', total)
  } finally {
    sqlite.close()
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
