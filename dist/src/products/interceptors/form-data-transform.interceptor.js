"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormDataTransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
let FormDataTransformInterceptor = class FormDataTransformInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        console.log('🔍 FormDataTransformInterceptor - Content-Type:', request.headers['content-type']);
        console.log('🔍 FormDataTransformInterceptor - Body:', request.body);
        if (request.headers['content-type']?.includes('multipart/form-data')) {
            const body = request.body;
            if (body && typeof body === 'object') {
                console.log('🔍 FormDataTransformInterceptor - Before transformation:', {
                    price: body.price,
                    stock: body.stock,
                    priceType: typeof body.price,
                    stockType: typeof body.stock
                });
                if (body.price && typeof body.price === 'string') {
                    body.price = parseFloat(body.price);
                }
                if (body.stock && typeof body.stock === 'string') {
                    body.stock = parseInt(body.stock);
                }
                if (body.images && !Array.isArray(body.images)) {
                    body.images = [body.images];
                }
                console.log('🔍 FormDataTransformInterceptor - After transformation:', {
                    price: body.price,
                    stock: body.stock,
                    priceType: typeof body.price,
                    stockType: typeof body.stock
                });
            }
        }
        return next.handle();
    }
};
exports.FormDataTransformInterceptor = FormDataTransformInterceptor;
exports.FormDataTransformInterceptor = FormDataTransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], FormDataTransformInterceptor);
//# sourceMappingURL=form-data-transform.interceptor.js.map