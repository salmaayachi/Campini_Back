import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user/entities/user.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CreateCampingDto } from './dto/create-camping.dto';
import { UpdateCampingDto } from './dto/update-camping.dto';
import { Camping } from './entities/camping.entity';

@Injectable()
export class CampingService {
  constructor(
    @InjectRepository(Camping)
    private campingRepository: Repository<Camping>,
  ) {}

  async joinEvent(user: User, id: number) {
    try {
      //find the camping
      const camping = await this.campingRepository.findOneOrFail(id);

      if (camping.participants) {
        camping.participants = [...camping.participants, user];
        console.log(camping.participants);
      } else {
        console.log('empty');
        camping.participants = [user];
      }

      //addedd the user to the camping
      console.log(camping.participants);

      //save it to the database
      return await this.campingRepository.save(camping);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException("You're not authorized");
    }
  }

  async createCamping(
    createCampingDto: CreateCampingDto,
    user: User,
  ): Promise<Camping> {
    try {
      const camping = await this.campingRepository.save({
        ...createCampingDto,
        organiser: user,
      });

      delete camping.organiser;

      return camping;
    } catch (error) {
      throw new BadRequestException('Cannot create camping');
    }
  }

  async getPastCampings(): Promise<Camping[]> {
    const myDate = new Date();
    const campings = await this.campingRepository.find({
      where: { date: LessThan(myDate) },
    });
    // console.log(campings[0].date.getTime());
    // console.log(myDate.getTime());
    // console.log(myDate.getTime() < campings[0].date.getTime());

    return campings;
  }

  async getUpcomingCampings(): Promise<Camping[]> {
    const myDate = new Date();
    const campings = await this.campingRepository.find({
      where: { date: MoreThan(myDate) },
    });
    return campings;
  }

  async getCampingsForUser(user: User): Promise<Camping[]> {
    return await this.campingRepository.find({ organiser: user });
  }

  async getAllCampings(): Promise<Camping[]> {
    try {
      return await this.campingRepository.find();
    } catch (error) {
      throw new BadRequestException('error while finding campings');
    }
  }

  async findCampingById(id: number): Promise<Camping> {
    try {
      return await this.campingRepository.findOne(id);
    } catch (error) {
      throw new BadRequestException(
        `error while finding camping with id ${id}`,
      );
    }
  }

  async updateCampingById(
    id: number,
    updateCampingDto: UpdateCampingDto,
    user: User,
  ): Promise<Camping> {
    try {
      let result = await this.findCampingById(id);
      // check if the user is the owner of the camping
      console.log(user.campingsCreated);
      let owner = false;
      user.campingsCreated.forEach((item) => {
        if (item.id == id) {
          owner = true;
        }
      });

      // if he's not the owner throw an exception
      if (owner == false) {
        throw new BadRequestException();
      }

      result = { ...result, ...updateCampingDto };
      await this.campingRepository.update(id, result);
      return result;
    } catch (error) {
      throw new BadRequestException(
        `error while updating camping with id ${id}`,
      );
    }
  }

  async deleteCampingById(id: number) {
    const result = await this.campingRepository.delete(id);
    if (result.raw.affectedRows == 1) {
      return {
        message: `deleted camping with id ${id}`,
      };
    }
    throw new BadRequestException(`error while deleting camping with id ${id}`);
  }
}
