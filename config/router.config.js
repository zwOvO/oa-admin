export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user'],
    routes: [
      // record
      { path: '/', redirect: '/record/table-list' },
      {
        path: '/record',
        icon: 'table',
        name: 'record',
        routes: [
          {
            path: '/record/table-list',
            name: 'recordList',
            component: './Record/TableList',
          },
          {
            path: '/record/monthRecord',
            name: 'monthRecord',
            component: './Record/MonthRecord',
          },
        ],
      },
      // forms
      // {
      //   path: '/form',
      //   icon: 'form',
      //   name: 'form',
      //   routes: [
      //     {
      //       path: '/form/basic-form',
      //       name: 'basicform',
      //       component: './Forms/BasicForm',
      //     },
      //   ],
      // },
      // license
      {
        path: '/license',
        icon: 'table',
        name: 'license',
        routes: [
          {
            path: '/license/table-list',
            name: 'licenseList',
            component: './License/TableList',
          },
        ],
      },
      // leave
      {
        path: '/leave',
        icon: 'table',
        name: 'leave',
        routes: [
          {
            path: '/leave/table-list',
            name: 'leaveList',
            component: './Leave/TableList',
          },
        ],
      },
      // userManager
      {
        path: '/userManager',
        icon: 'table',
        name: 'userManager',
        routes: [
          {
            path: '/userManager/table-list',
            name: 'userManagerList',
            component: './UserManager/TableList',
          },
        ],
      },
      // {
      //   name: 'result',
      //   icon: 'check-circle-o',
      //   path: '/result',
      //   routes: [
      //     // result
      //     {
      //       path: '/result/success',
      //       name: 'success',
      //       component: './Result/Success',
      //     },
      //     { path: '/result/fail', name: 'fail', component: './Result/Error' },
      //   ],
      // },
      // {
      //   name: 'exception',
      //   icon: 'warning',
      //   path: '/exception',
      //   routes: [
      //     // exception
      //     {
      //       path: '/exception/403',
      //       name: 'not-permission',
      //       component: './Exception/403',
      //     },
      //     {
      //       path: '/exception/404',
      //       name: 'not-find',
      //       component: './Exception/404',
      //     },
      //     {
      //       path: '/exception/500',
      //       name: 'server-error',
      //       component: './Exception/500',
      //     },
      //     {
      //       path: '/exception/trigger',
      //       name: 'trigger',
      //       hideInMenu: true,
      //       component: './Exception/TriggerException',
      //     },
      //   ],
      // },
    ],
  },
];
