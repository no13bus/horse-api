import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@/common/enums/role.enum";

export const ROLES_KEY = "roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.headers["x-user-role"] as UserRole;

    // Check if user's role is in the required roles
    return requiredRoles.includes(userRole);
  }
}
