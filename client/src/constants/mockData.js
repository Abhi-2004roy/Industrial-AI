export const mockUser = {
  id: '1',
  name: 'Alex Morgan',
  email: 'alex.morgan@industrial.ai',
  role: 'admin',
  department: 'Operations',
  avatar: null,
  joinedAt: '2024-03-15',
}

export const mockDocuments = [
  {
    id: '1',
    title: 'Hydraulic Press Maintenance Manual',
    type: 'Manual',
    category: 'Maintenance',
    status: 'processed',
    size: '2.4 MB',
    pages: 48,
    uploadedBy: 'Sarah Chen',
    uploadedAt: '2026-07-10T09:30:00Z',
    uploadDate: 'Jul 10, 2026',
    tags: ['maintenance', 'hydraulics', 'safety'],
    summary: 'Comprehensive maintenance procedures for hydraulic press systems including daily checks, lubrication schedules, and troubleshooting guides.',
    description: 'Complete guide for maintaining industrial hydraulic presses.'
  },
  {
    id: '2',
    title: 'Quality Control SOP - Line 3',
    type: 'SOP',
    category: 'Quality',
    status: 'processed',
    size: '1.0 MB',
    pages: 24,
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2026-07-08T14:15:00Z',
    uploadDate: 'Jul 08, 2026',
    tags: ['quality', 'sop', 'line-3'],
    summary: 'Standard operating procedures for quality control inspections on production line 3.',
    description: 'Step-by-step quality control procedures.'
  },
  {
    id: '3',
    title: 'Safety Incident Report Q2 2026',
    type: 'Report',
    category: 'Safety',
    status: 'processing',
    size: '512 KB',
    pages: 12,
    uploadedBy: 'Alex Morgan',
    uploadedAt: '2026-07-15T11:00:00Z',
    uploadDate: 'Jul 15, 2026',
    tags: ['safety', 'incident', 'quarterly'],
    summary: 'Quarterly safety incident analysis and corrective action recommendations.',
    description: 'Safety report for Q2 2026.'
  },
  {
    id: '4',
    title: 'CNC Machine Calibration Spec',
    type: 'Specification',
    category: 'Engineering',
    status: 'processed',
    size: '3.1 MB',
    pages: 36,
    uploadedBy: 'David Park',
    uploadedAt: '2026-07-05T16:45:00Z',
    uploadDate: 'Jul 05, 2026',
    tags: ['cnc', 'calibration', 'specification'],
    summary: 'Technical specifications and calibration procedures for CNC machining centers.',
    description: 'Calibration specifications for CNC machines.'
  },
  {
    id: '5',
    title: 'New Employee Safety Training',
    type: 'Training',
    category: 'Safety',
    status: 'processed',
    size: '8.4 MB',
    pages: 64,
    uploadedBy: 'Lisa Wong',
    uploadedAt: '2026-06-28T10:00:00Z',
    uploadDate: 'Jun 28, 2026',
    tags: ['training', 'safety', 'onboarding'],
    summary: 'Mandatory safety training materials for new manufacturing floor employees.',
    description: 'Safety training for new hires.'
  },
  {
    id: '6',
    title: 'Warehouse Inventory Protocol',
    type: 'SOP',
    category: 'Logistics',
    status: 'pending',
    size: '768 KB',
    pages: 18,
    uploadedBy: 'Tom Baker',
    uploadedAt: '2026-07-17T08:30:00Z',
    uploadDate: 'Jul 17, 2026',
    tags: ['warehouse', 'inventory', 'logistics'],
    summary: 'Inventory management and warehouse safety protocols.',
    description: 'Warehouse inventory management procedures.'
  },
]

export const mockAnalytics = {
  overview: {
    totalDocuments: 1247,
    documentsThisMonth: 89,
    activeUsers: 156,
    aiQueries: 3420,
    processingRate: 94.5,
    avgProcessingTime: '2.3 min',
  },
  documentTrend: [
    { month: 'Jan', uploaded: 65, processed: 62 },
    { month: 'Feb', uploaded: 78, processed: 75 },
    { month: 'Mar', uploaded: 92, processed: 88 },
    { month: 'Apr', uploaded: 85, processed: 82 },
    { month: 'May', uploaded: 98, processed: 95 },
    { month: 'Jun', uploaded: 110, processed: 105 },
    { month: 'Jul', uploaded: 89, processed: 84 },
  ],
  categoryDistribution: [
    { name: 'Manuals', value: 320, color: '#1b4d8c' },
    { name: 'SOPs', value: 280, color: '#2563eb' },
    { name: 'Reports', value: 195, color: '#f97316' },
    { name: 'Specs', value: 165, color: '#22c55e' },
    { name: 'Training', value: 145, color: '#8b5cf6' },
    { name: 'Safety', value: 142, color: '#ef4444' },
  ],
  aiUsage: [
    { day: 'Mon', queries: 420, summaries: 85 },
    { day: 'Tue', queries: 510, summaries: 92 },
    { day: 'Wed', queries: 480, summaries: 78 },
    { day: 'Thu', queries: 550, summaries: 105 },
    { day: 'Fri', queries: 490, summaries: 88 },
    { day: 'Sat', queries: 120, summaries: 25 },
    { day: 'Sun', queries: 95, summaries: 18 },
  ],
  topDocuments: [
    { title: 'Hydraulic Press Manual', views: 342, queries: 89 },
    { title: 'Safety Training Guide', views: 298, queries: 76 },
    { title: 'QC SOP Line 3', views: 256, queries: 64 },
    { title: 'CNC Calibration Spec', views: 198, queries: 52 },
    { title: 'Emergency Procedures', views: 187, queries: 48 },
  ],
}

export const mockUsers = [
  { id: '1', name: 'Alex Morgan', email: 'alex.morgan@industrial.ai', role: 'admin', department: 'Operations', status: 'active', lastActive: '2026-07-18T08:00:00Z' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@industrial.ai', role: 'manager', department: 'Engineering', status: 'active', lastActive: '2026-07-18T07:45:00Z' },
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@industrial.ai', role: 'operator', department: 'Production', status: 'active', lastActive: '2026-07-17T16:30:00Z' },
  { id: '4', name: 'Lisa Wong', email: 'lisa.wong@industrial.ai', role: 'manager', department: 'Safety', status: 'active', lastActive: '2026-07-17T14:00:00Z' },
  { id: '5', name: 'David Park', email: 'david.park@industrial.ai', role: 'operator', department: 'Maintenance', status: 'inactive', lastActive: '2026-07-10T09:00:00Z' },
  { id: '6', name: 'Tom Baker', email: 'tom.baker@industrial.ai', role: 'viewer', department: 'Logistics', status: 'active', lastActive: '2026-07-18T06:15:00Z' },
]

export const mockNotifications = [
  { id: '1', title: 'Document processed', message: 'Hydraulic Press Manual has been processed and indexed.', type: 'success', read: false, createdAt: '2026-07-18T08:30:00Z' },
  { id: '2', title: 'New user registered', message: 'Tom Baker joined the Logistics department.', type: 'info', read: false, createdAt: '2026-07-18T07:00:00Z' },
  { id: '3', title: 'Processing failed', message: 'Warehouse Inventory Protocol failed to process. Retry available.', type: 'error', read: true, createdAt: '2026-07-17T15:00:00Z' },
  { id: '4', title: 'Weekly report ready', message: 'Your analytics report for week 28 is available.', type: 'info', read: true, createdAt: '2026-07-17T09:00:00Z' },
  { id: '5', title: 'AI quota warning', message: 'You have used 85% of your monthly AI query quota.', type: 'warning', read: false, createdAt: '2026-07-16T12:00:00Z' },
]

export const mockChatHistory = [
  { id: '1', role: 'assistant', content: 'Hello! I\'m your Industrial AI assistant. I can help you find information in your knowledge base, summarize documents, and answer technical questions. How can I help you today?', timestamp: '2026-07-18T08:00:00Z' },
]

export const mockDashboardStats = [
  { label: 'Total Documents', value: '1,247', change: '+12%', trend: 'up', icon: 'FileText' },
  { label: 'AI Queries Today', value: '342', change: '+8%', trend: 'up', icon: 'MessageSquare' },
  { label: 'Active Users', value: '156', change: '+3%', trend: 'up', icon: 'Users' },
  { label: 'Processing Rate', value: '94.5%', change: '-1.2%', trend: 'down', icon: 'Activity' },
]

export const mockRecentActivity = [
  { id: '1', action: 'uploaded', user: 'Sarah Chen', document: 'Hydraulic Press Manual', time: '2 hours ago' },
  { id: '2', action: 'queried', user: 'Mike Johnson', document: 'QC SOP Line 3', time: '3 hours ago' },
  { id: '3', action: 'summarized', user: 'Alex Morgan', document: 'Safety Report Q2', time: '5 hours ago' },
  { id: '4', action: 'shared', user: 'Lisa Wong', document: 'Training Guide', time: '1 day ago' },
  { id: '5', action: 'processed', user: 'System', document: 'CNC Calibration Spec', time: '1 day ago' },
]
