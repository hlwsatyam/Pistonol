import { 
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  SettingOutlined,
  FileTextOutlined,
  IdcardOutlined,
  PayCircleOutlined,
  ScheduleOutlined,
  PieChartOutlined,
  LockOutlined
} from '@ant-design/icons';

const menuItems = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardOutlined />,
    permission: 'DASHBOARD_VIEW'
  },
  {
    key: 'employees',
    title: 'Employees',
    icon: <TeamOutlined />,
    permission: 'EMPLOYEES_VIEW',
    children: [
      {
        key: 'create-employee',
        title: 'Create Employee',
        path: '/employees/create',
        permission: 'EMPLOYEES_CREATE'
      },
      {
        key: 'manage-employees',
        title: 'Manage Employees',
        path: '/employees/manage',
        permission: 'EMPLOYEES_MANAGE'
      },
      {
        key: 'employee-directory',
        title: 'Employee Directory',
        path: '/employees/directory',
        permission: 'EMPLOYEES_VIEW'
      }
    ]
  },
  {
    key: 'attendance',
    title: 'Attendance',
    icon: <IdcardOutlined />,
    permission: 'ATTENDANCE_VIEW',
    children: [
      {
        key: 'mark-attendance',
        title: 'Mark Attendance',
        path: '/attendance/mark',
        permission: 'ATTENDANCE_MARK'
      },
      {
        key: 'attendance-records',
        title: 'Attendance Records',
        path: '/attendance/records',
        permission: 'ATTENDANCE_VIEW'
      },
      {
        key: 'leave-management',
        title: 'Leave Management',
        path: '/attendance/leave',
        permission: 'LEAVE_MANAGE'
      }
    ]
  },
  {
    key: 'payroll',
    title: 'Payroll',
    icon: <PayCircleOutlined />,
    permission: 'PAYROLL_VIEW',
    children: [
      {
        key: 'salary-settings',
        title: 'Salary Settings',
        path: '/payroll/salary',
        permission: 'PAYROLL_MANAGE'
      },
      {
        key: 'payslips',
        title: 'Payslips',
        path: '/payroll/payslips',
        permission: 'PAYROLL_VIEW'
      },
      {
        key: 'tax-settings',
        title: 'Tax Settings',
        path: '/payroll/tax',
        permission: 'PAYROLL_MANAGE'
      }
    ]
  },
  {
    key: 'reports',
    title: 'Reports',
    icon: <PieChartOutlined />,
    permission: 'REPORTS_VIEW',
    children: [
      {
        key: 'employee-reports',
        title: 'Employee Reports',
        path: '/reports/employees',
        permission: 'REPORTS_EMPLOYEES'
      },
      {
        key: 'attendance-reports',
        title: 'Attendance Reports',
        path: '/reports/attendance',
        permission: 'REPORTS_ATTENDANCE'
      },
      {
        key: 'payroll-reports',
        title: 'Payroll Reports',
        path: '/reports/payroll',
        permission: 'REPORTS_PAYROLL'
      }
    ]
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: <SettingOutlined />,
    permission: 'SETTINGS_VIEW',
    children: [
      {
        key: 'company-settings',
        title: 'Company Settings',
        path: '/settings/company',
        permission: 'SETTINGS_COMPANY'
      },
      {
        key: 'permission-settings',
        title: 'Permission Settings',
        path: '/settings/permissions',
        permission: 'SETTINGS_PERMISSIONS'
      },
      {
        key: 'user-roles',
        title: 'User Roles',
        path: '/settings/roles',
        permission: 'SETTINGS_ROLES'
      },
      {
        key: 'system-settings',
        title: 'System Settings',
        path: '/settings/system',
        permission: 'SETTINGS_SYSTEM'
      }
    ]
  }
];

export default menuItems;