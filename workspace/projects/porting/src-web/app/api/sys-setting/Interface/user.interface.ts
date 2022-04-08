interface CreateUser {
  username: string;
  workspace: string;
  admin_password: string;
  password: string;
  confirm_password: string;
  role: string;
}

interface UpdatePwd {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface ResetPwd {
  admin_password: string;
  password: string;
  confirm_password: string;
}

interface DelUser {
  admin_password: string;
}

export {
  CreateUser,
  UpdatePwd,
  ResetPwd,
  DelUser
};
