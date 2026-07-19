import { SessionType } from "@/lib/auth/server/auth";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function getUserPerms(user?: SessionType["user"]) {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    switch (user?.role) {
        case "ADMIN":
            can("manage", "all");

            break;
        case "STAFF":
            can("manage", "all");

            break;
        case "SELLER":
            can("read", "product");
            can("create", "product");
            can("update", "product");
            can("delete", "product")

            can("read", "cart")
            can("read", "productCategory")

            break;
        case "BUYER":
            can("read", "product");
            can("view", "product")

            can("view", "dashboard")
            can("read", "cart")

            can("read", "productCategory")

            break;

        default:
            can("read", "product");
            can("read", "cart")

            can("read", "productCategory")

    }

    return build();
}