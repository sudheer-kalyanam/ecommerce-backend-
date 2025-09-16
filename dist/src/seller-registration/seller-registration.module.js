"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerRegistrationModule = void 0;
const common_1 = require("@nestjs/common");
const seller_registration_service_1 = require("./seller-registration.service");
const seller_registration_controller_1 = require("./seller-registration.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const email_module_1 = require("../email/email.module");
const upload_module_1 = require("../upload/upload.module");
let SellerRegistrationModule = class SellerRegistrationModule {
};
exports.SellerRegistrationModule = SellerRegistrationModule;
exports.SellerRegistrationModule = SellerRegistrationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, email_module_1.EmailModule, upload_module_1.UploadModule],
        controllers: [seller_registration_controller_1.SellerRegistrationController],
        providers: [seller_registration_service_1.SellerRegistrationService],
        exports: [seller_registration_service_1.SellerRegistrationService],
    })
], SellerRegistrationModule);
//# sourceMappingURL=seller-registration.module.js.map