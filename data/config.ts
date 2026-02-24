export const mockConfig = {
  "systemBranding": {
    "name": "Brigada Learning System",
    "logo": "Brigada",
    "tagline": "Learning System"
  },
  "navigation": {
    "groups": [
      {
        "title": "Overview",
        "items": [
          {
            "name": "Dashboard",
            "path": "/admin",
            "icon": "LayoutDashboard"
          }
        ]
      },
      {
        "title": "Learning Content",
        "items": [
          {
            "name": "Learning Paths",
            "path": "/admin/learning-paths",
            "icon": "Waypoints"
          },
          {
            "name": "Create Module",
            "path": "/admin/create-module",
            "icon": "PlusCircle"
          },
          {
            "name": "Manage Modules",
            "path": "/admin/modules",
            "icon": "Library"
          },
          {
            "name": "Certificates",
            "path": "/admin/certificates",
            "icon": "Award"
          }
        ]
      },
      {
        "title": "Workforce",
        "items": [
          {
            "name": "Employees",
            "path": "/admin/employees",
            "icon": "Users"
          },
          {
            "name": "Manage Role",
            "path": "/admin/manage-role",
            "icon": "ShieldCheck"
          },
          {
            "name": "Access Restrictions",
            "path": "/admin/restricted",
            "icon": "Lock"
          }
        ]
      },
      {
        "title": "Engagement",
        "items": [
          {
            "name": "Messages",
            "path": "/admin/messages",
            "icon": "MessageSquare"
          },
          {
            "name": "Announcements",
            "path": "/admin/announcements",
            "icon": "Megaphone"
          },
          {
            "name": "Calendar",
            "path": "/admin/calendar",
            "icon": "Calendar"
          }
        ]
      }
    ],
    "reports": [
      {
        "name": "Progress Report",
        "path": "/admin/reports/progress",
        "icon": "TrendingUp"
      },
      {
        "name": "Retake Report",
        "path": "/admin/reports/retake",
        "icon": "RotateCcw"
      },
      {
        "name": "Completion Report",
        "path": "/admin/reports/completion",
        "icon": "CheckCircle"
      }
    ]
  },
  "currentUser": {
    "id": "admin-1",
    "first_name": "Alex",
    "last_name": "Morgan",
    "name": "Alex Morgan",
    "email": "alex.morgan@company.com",
    "role": "Admin",
    "admin_role": "Super Admin",
    "department": "Administration",
    "business_unit": "Corporate Services",
    "position": "Principal Administrator",
    "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  "roles": [
    {
      "id": "1",
      "name": "Super Admin",
      "members": 2,
      "permissions": "Full Access",
      "created": "Jan 1, 2024"
    },
    {
      "id": "2",
      "name": "Instructor",
      "members": 15,
      "permissions": "Create & Grade Modules",
      "created": "Jan 1, 2024"
    },
    {
      "id": "3",
      "name": "Employee",
      "members": 183,
      "permissions": "View & Complete Modules",
      "created": "Jan 1, 2024"
    }
  ],
  "contacts": [
    {
      "id": 1,
      "name": "Sarah Drasner",
      "lastMsg": "Can we schedule a call?",
      "time": "2m ago",
      "unread": 2,
      "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      "id": 2,
      "name": "Ryan Dahl",
      "lastMsg": "The module update is ready.",
      "time": "1h ago",
      "unread": 0,
      "avatar": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      "id": 3,
      "name": "Alice Johnson",
      "lastMsg": "I have a question about the assignment.",
      "time": "3h ago",
      "unread": 0,
      "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ],
  "settingsSections": [
    {
      "id": "general",
      "title": "General",
      "description": "Organization name, timezone, and language preferences",
      "options": [
        {
          "name": "Organization Name",
          "desc": "Brigada Learning System"
        },
        {
          "name": "Timezone",
          "desc": "Coordinated Universal Time (UTC)"
        },
        {
          "name": "Language",
          "desc": "English (US)"
        }
      ]
    },
    {
      "id": "notifications",
      "title": "Notifications",
      "description": "Email alerts, in-app notifications, and digest settings",
      "options": [
        {
          "name": "Email Notifications",
          "desc": "Enabled"
        },
        {
          "name": "Push Notifications",
          "desc": "Disabled"
        },
        {
          "name": "Weekly Digest",
          "desc": "Enabled"
        }
      ]
    },
    {
      "id": "appearance",
      "title": "Appearance",
      "description": "Branding, logo, colors, and theme customization",
      "options": [
        {
          "name": "System Theme",
          "desc": "Light"
        },
        {
          "name": "Primary Color",
          "desc": "#0f172a"
        },
        {
          "name": "Logo Alignment",
          "desc": "Left"
        }
      ]
    },
    {
      "id": "security",
      "title": "Security",
      "description": "Password policies, two-factor authentication, and session settings",
      "options": [
        {
          "name": "Two-Factor Auth",
          "desc": "Enforced"
        },
        {
          "name": "Password Expiry",
          "desc": "90 Days"
        },
        {
          "name": "Idle Timeout",
          "desc": "30 Minutes"
        }
      ]
    },
    {
      "id": "data",
      "title": "Data & Storage",
      "description": "Backup schedule, storage usage, and data retention policies",
      "options": [
        {
          "name": "Backup Interval",
          "desc": "Daily"
        },
        {
          "name": "Storage Limit",
          "desc": "100 GB"
        },
        {
          "name": "Retention Policy",
          "desc": "7 Years"
        }
      ]
    }
  ],
  "dashboardData": {
    "stats": {
      "totalEmployees": "12.4k",
      "activeModules": "342",
      "avgQuizScore": "84%",
      "learningHours": "1920h",
      "currentMonthHours": "2400"
    },
    "areaChart": [
      {
        "name": "SEP",
        "hours": 1200,
        "active": 400
      },
      {
        "name": "OCT",
        "hours": 1450,
        "active": 600
      },
      {
        "name": "NOV",
        "hours": 1300,
        "active": 550
      },
      {
        "name": "DEC",
        "hours": 1800,
        "active": 800
      },
      {
        "name": "JAN",
        "hours": 1600,
        "active": 700
      },
      {
        "name": "FEB",
        "hours": 2100,
        "active": 950
      },
      {
        "name": "MAR",
        "hours": 2400,
        "active": 1100
      },
      {
        "name": "APR",
        "hours": 2250,
        "active": 1000
      }
    ],
    "barChart": [
      {
        "name": "Mon",
        "activity": 40,
        "trend": 35
      },
      {
        "name": "Tue",
        "activity": 60,
        "trend": 50
      },
      {
        "name": "Wed",
        "activity": 80,
        "trend": 65
      },
      {
        "name": "Thu",
        "activity": 50,
        "trend": 55
      },
      {
        "name": "Fri",
        "activity": 90,
        "trend": 75
      },
      {
        "name": "Sat",
        "activity": 30,
        "trend": 50
      },
      {
        "name": "Sun",
        "activity": 70,
        "trend": 60
      }
    ],
    "radarChart": [
      {
        "subject": "Technical",
        "A": 120,
        "fullMark": 150
      },
      {
        "subject": "Soft Skills",
        "A": 98,
        "fullMark": 150
      },
      {
        "subject": "Leadership",
        "A": 86,
        "fullMark": 150
      },
      {
        "subject": "Compliance",
        "A": 140,
        "fullMark": 150
      },
      {
        "subject": "Product",
        "A": 85,
        "fullMark": 150
      },
      {
        "subject": "Sales",
        "A": 65,
        "fullMark": 150
      }
    ],
    "pieChart": [
      {
        "name": "Video Lectures",
        "value": 45
      },
      {
        "name": "Interactive Labs",
        "value": 25
      },
      {
        "name": "Quizzes",
        "value": 20
      },
      {
        "name": "Reading Material",
        "value": 10
      }
    ]
  },
  "reportsData": {
    "activityTrend": [
      {
        "name": "Mon",
        "active": 2400,
        "completions": 120
      },
      {
        "name": "Tue",
        "active": 1398,
        "completions": 98
      },
      {
        "name": "Wed",
        "active": 9800,
        "completions": 350
      },
      {
        "name": "Thu",
        "active": 3908,
        "completions": 200
      },
      {
        "name": "Fri",
        "active": 4800,
        "completions": 240
      },
      {
        "name": "Sat",
        "active": 3800,
        "completions": 150
      },
      {
        "name": "Sun",
        "active": 4300,
        "completions": 180
      }
    ],
    "completionRates": [
      {
        "name": "React",
        "completion": 85
      },
      {
        "name": "Node",
        "completion": 65
      },
      {
        "name": "Design",
        "completion": 90
      },
      {
        "name": "SQL",
        "completion": 45
      },
      {
        "name": "DevOps",
        "completion": 30
      }
    ],
    "certifiedCompletions": []
  },
  "certificates": [
    {
      "id": "1",
      "name": "Academy Universal Certificate",
      "issued": 1406,
      "template": "Universal Premium",
      "businessUnit": "All Units",
      "moduleType": "General",
      "signatories": [
        { "name": "Jonald Penpillo", "title": "Chief Executive Officer" },
        { "name": "Alex Morgan", "title": "VP of Engineering" }
      ],
      "primaryColor": "#0f172a",
      "backgroundImage": "/images/academy_cert_bg.webp",
      "lastIssued": "Feb 23, 2026"
    }
  ],
  "commonData": {
    "departments": [
      "Engineering",
      "Marketing",
      "Sales",
      "Operations",
      "HR",
      "Legal",
      "Finance",
      "Product"
    ],
    "positions": [
      "VP Engineering",
      "Senior Developer",
      "Content Strategist",
      "Account Manager",
      "Product Manager",
      "Chief Legal Officer",
      "Junior Researcher",
      "Founder & Advisor",
      "HR Business Partner",
      "Fleet Operations Lead"
    ],
    "ranks": [
      "L1",
      "L2",
      "L3",
      "L4",
      "L5",
      "L6",
      "L7",
      "L8",
      "L9"
    ],
    "statuses": [
      "Active",
      "Inactive",
      "On Leave"
    ],
    "businessUnits": [
      "Technology & Innovation",
      "Growth & Brands",
      "Corporate Services",
      "Logistics & Supply",
      "Market Expansion"
    ],
    "companies": [
      "Brigada Corp",
      "Lumina Global",
      "EdTech Solutions"
    ],
    "contractTypes": [
      "Permanent",
      "Full-time",
      "Contract",
      "Temporary",
      "Consultant"
    ],
    "employmentStatuses": [
      "Regular",
      "Probation",
      "Contract",
      "Intern"
    ],
    "firstNames": [
      "Alice",
      "Bob",
      "Charlie",
      "Diana",
      "Edward",
      "Frank",
      "Gloria",
      "Howard",
      "Ivy",
      "Jack"
    ],
    "lastNames": [
      "Johnson",
      "Smith",
      "Davis",
      "Evans",
      "Martinez",
      "Reynolds",
      "Borger",
      "Stark",
      "League",
      "Sparrow"
    ]
  },
  "restrictedProfiles": [],
  "calendarEvents": []
};