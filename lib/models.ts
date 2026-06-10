import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export interface IControlData {
  type: 'probable_options' | 'single_select' | 'structured_form'
  options?: string[]
  completed: boolean
  partial_values?: Record<string, string>[]
  total_cards?: number
  input_card_variables?: { label: string; key: string; required: boolean }[]
}

export interface IHistoryEntry {
  role: 'user' | 'assistant'
  content: string
  controls?: IControlData
}

export interface IEscalationDetails {
  reason?: string
  priority?: string
  urgency?: string
  impact?: string
  support_group?: string
  description?: string
}

export interface IResolutionDetails {
  summary?: string
}

export interface IFeedback {
  rating?: number
  comment?: string
  submitted: boolean
}

export interface IIncident extends Document {
  incident_id: string
  user_id: mongoose.Types.ObjectId
  status: 'Open' | 'Escalated' | 'Resolved'
  category: string
  history: IHistoryEntry[]
  escalation_details: IEscalationDetails
  resolution_details: IResolutionDetails
  feedback: IFeedback
  lastupdatedby: string
  timestamps: { created: Date; updated: Date }
}

const ControlDataSchema = new Schema({
  type: { type: String, enum: ['probable_options', 'single_select', 'structured_form'] },
  options: [String],
  completed: { type: Boolean, default: false },
  partial_values: [Schema.Types.Mixed],
  total_cards: Number,
  input_card_variables: [Schema.Types.Mixed],
}, { _id: false })

const HistoryEntrySchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  controls: ControlDataSchema,
}, { _id: false })

const IncidentSchema = new Schema<IIncident>({
  incident_id: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Escalated', 'Resolved'], default: 'Open' },
  category: { type: String, default: '' },
  history: [HistoryEntrySchema],
  escalation_details: { type: Schema.Types.Mixed, default: {} },
  resolution_details: { type: Schema.Types.Mixed, default: {} },
  feedback: {
    rating: Number,
    comment: String,
    submitted: { type: Boolean, default: false },
  },
  lastupdatedby: { type: String, default: 'Patch' },
  timestamps: {
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
  },
})

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export const Incident = mongoose.models['Patch Transactions'] ||
  mongoose.model<IIncident>('Patch Transactions', IncidentSchema)
