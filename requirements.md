# Hotel Marseille - Requirements

## Product Goal

Hotel Marseille needs a private web program to replace the current Excel table used for controlling guest check-ins, check-outs, room occupancy, payment status, and debt.

## Current Scope

The first working version should be simple, reliable, and usable by the hotel staff.

## Rooms

The hotel has 13 rooms:

- 3 Suites: 101, 106, 207
- 6 Standard rooms: 102, 104, 202, 203, 204, 205
- 1 Twin room: 103
- 1 Triple room: 105
- 2 Junior Suites: 201, 206

## Stay Data

Each stay should store:

- Guest name
- Check-in date
- Check-out date
- Room
- Calendar color
- Total price in Georgian lari
- Cash amount
- Card amount
- Invoice / bank transfer amount
- Debt amount
- Notes / special conditions

## Language

The current version is English.

The client may later request Georgian. The app should be structured so localization can be added in a later stage.

## Storage

Current demo:

- Browser `localStorage`

First working version:

- Supabase database
- Private login for one user

## Deployment

Planned setup:

- GitHub for version control
- Vercel for hosting
- Supabase for database and authentication

## Stages

### Stage 1

Private working version with login, Supabase storage, dashboard, records, calendar, rooms, and editing.

### Stage 2

Reports, export, roles, activity history, and operational improvements.

### Stage 3

Localization, invoice templates, attachments, notifications, and advanced workflows.
