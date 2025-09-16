import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FormDataTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    console.log('🔍 FormDataTransformInterceptor - Content-Type:', request.headers['content-type']);
    console.log('🔍 FormDataTransformInterceptor - Body:', request.body);
    
    // Only process if it's a multipart/form-data request
    if (request.headers['content-type']?.includes('multipart/form-data')) {
      const body = request.body;
      
      // Only transform if body exists and has the expected properties
      if (body && typeof body === 'object') {
        console.log('🔍 FormDataTransformInterceptor - Before transformation:', {
          price: body.price,
          stock: body.stock,
          priceType: typeof body.price,
          stockType: typeof body.stock
        });
        
        // Transform string values to appropriate types
        if (body.price && typeof body.price === 'string') {
          body.price = parseFloat(body.price);
        }
        
        if (body.stock && typeof body.stock === 'string') {
          body.stock = parseInt(body.stock);
        }
        
        // Ensure images is an array if it exists
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
}
