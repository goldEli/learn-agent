import { Inject, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

type Book = { id: number; title: string };

type BookRepository = {
  findAll: () => Book[];
};

@Injectable()
export class BookService {
  @Inject('BOOK_REPOSITORY')
  private readonly bookRepository: BookRepository;

  create(_createBookDto: CreateBookDto): string {
    void _createBookDto;
    return 'This action adds a new book';
  }

  findAll(): Book[] {
    return this.bookRepository.findAll();
  }

  findOne(id: number): string {
    return `This action returns a #${id} book`;
  }

  update(id: number, _updateBookDto: UpdateBookDto): string {
    void _updateBookDto;
    return `This action updates a #${id} book`;
  }

  remove(id: number): string {
    return `This action removes a #${id} book`;
  }
}
