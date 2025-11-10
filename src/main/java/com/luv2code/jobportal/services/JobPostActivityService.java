package com.luv2code.jobportal.services;

import com.luv2code.jobportal.entity.*;
import com.luv2code.jobportal.repository.JobPostActivityRepository;
import com.luv2code.jobportal.repository.JobSeekerApplyRepository;
import com.luv2code.jobportal.repository.JobSeekerSaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class JobPostActivityService {

    private final JobPostActivityRepository jobPostActivityRepository;
    private final JobSeekerApplyRepository jobSeekerApplyRepository;
    private final JobSeekerSaveRepository jobSeekerSaveRepository;
    private final UsersService usersService; // để kiểm tra quyền sở hữu & lấy profile hiện tại

    public JobPostActivityService(JobPostActivityRepository jobPostActivityRepository,
                                  JobSeekerApplyRepository jobSeekerApplyRepository,
                                  JobSeekerSaveRepository jobSeekerSaveRepository,
                                  UsersService usersService) {
        this.jobPostActivityRepository = jobPostActivityRepository;
        this.jobSeekerApplyRepository = jobSeekerApplyRepository;
        this.jobSeekerSaveRepository = jobSeekerSaveRepository;
        this.usersService = usersService;
    }



    @Transactional
    public JobPostActivity addNew(JobPostActivity jobPostActivity) {
        return jobPostActivityRepository.save(jobPostActivity);
    }

    public JobPostActivity getOne(int id) {
        return jobPostActivityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public List<JobPostActivity> getAll() {
        return jobPostActivityRepository.findAllByOrderByPostedDateDesc();
    }


    public List<JobPostActivity> search(String job,
                                        String location,
                                        List<String> type,
                                        List<String> remote,
                                        LocalDate searchDate) {

        // Chuẩn hóa input
        String kw = StringUtils.hasText(job) ? job.trim() : null;
        String loc = StringUtils.hasText(location) ? location.trim() : null;

        List<String> types = (type == null) ? List.of() : filtered(type);
        List<String> remotes = (remote == null) ? List.of() : filtered(remote);

        // Gọi repo đúng chữ ký
        return (searchDate == null)
                ? jobPostActivityRepository.searchWithoutDate(kw, loc, remotes, types)
                : jobPostActivityRepository.search(kw, loc, remotes, types, searchDate);
    }

    private static List<String> filtered(List<String> in) {
        return in.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    public List<RecruiterJobsDto> getRecruiterJobs(int recruiter) {
        List<IRecruiterJobs> rows = jobPostActivityRepository.getRecruiterJobs(recruiter);
        List<RecruiterJobsDto> out = new ArrayList<>();
        for (IRecruiterJobs rec : rows) {
            JobLocation loc = new JobLocation(rec.getLocationId(), rec.getCity(), rec.getState(), rec.getCountry());
            JobCompany comp = new JobCompany(rec.getCompanyId(), rec.getName(), "");
            out.add(new RecruiterJobsDto(
                    rec.getTotalCandidates(),
                    rec.getJob_post_id(),
                    rec.getJob_title(),
                    loc,
                    comp
            ));
        }
        return out;
    }

    // Lấy toàn bộ job do recruiter hiện tại đăng (để hiển thị mặc định danh sách)
    public List<JobPostActivity> getRecruiterOwnJobs() {
        Users u = usersService.getCurrentUser();
        if (u == null) {
            throw new SecurityException("Bạn chưa đăng nhập.");
        }
        return jobPostActivityRepository
                .findByPostedByIdUserIdOrderByPostedDateDesc(u.getUserId());
    }


    public List<JobPostActivity> searchRecruiterOwn(String job, String location) {
        Users u = usersService.getCurrentUser();
        if (u == null) {
            throw new SecurityException("Bạn chưa đăng nhập.");
        }
        String j = (job == null || job.isBlank()) ? null : job.trim();
        String l = (location == null || location.isBlank()) ? null : location.trim();
        return jobPostActivityRepository.searchOwn(u.getUserId(), j, l);
    }



    @Transactional
    public void updateFromForm(int id, JobPostActivity form) {
        JobPostActivity job = getOne(id);
        Users current = usersService.getCurrentUser();
        if (current == null || job.getPostedById() == null
                || !Objects.equals(job.getPostedById().getUserId(), current.getUserId())) {
            throw new SecurityException("Bạn không có quyền sửa job này");
        }


        job.setJobTitle(form.getJobTitle());
        job.setJobType(form.getJobType());
        job.setRemote(form.getRemote());
        job.setSalary(form.getSalary());
        job.setDescriptionOfJob(form.getDescriptionOfJob());
        job.setJobLocationId(form.getJobLocationId());
        job.setJobCompanyId(form.getJobCompanyId());
        job.setExperienceRequired(form.getExperienceRequired());
        job.setCertificateRequired(form.getCertificateRequired());
        job.setField(form.getField());
        job.setNumber(form.getNumber());


        jobPostActivityRepository.save(job);
    }


    @Transactional
    public void delete(int id) {
        JobPostActivity job = getOne(id);
        Users current = usersService.getCurrentUser();
        if (current == null || job.getPostedById() == null
                || !Objects.equals(job.getPostedById().getUserId(), current.getUserId())) {
            throw new SecurityException("Bạn không có quyền xóa job này");
        }
        jobPostActivityRepository.delete(job); // DB đã bật FK ON DELETE CASCADE thì sẽ tự xóa apply/save
    }


    public List<JobPostActivity> searchOnly(String job, String location) {
        String j = (job == null || job.isBlank()) ? null : job.trim();
        String l = (location == null || location.isBlank()) ? null : location.trim();

        List<JobPostActivity> result = (j == null && l == null)
                ? jobPostActivityRepository.findAllByOrderByPostedDateDesc()
                : jobPostActivityRepository.searchByKeyword(j, l);


        return decorateWithUserFlags(result);
    }


    private List<JobPostActivity> decorateWithUserFlags(List<JobPostActivity> jobs) {
        if (jobs == null || jobs.isEmpty()) return jobs;

        Object profile = usersService.getCurrentUserProfile();
        if (profile instanceof JobSeekerProfile jobSeeker) {
            // lấy danh sách apply & save của ứng viên hiện tại
            List<JobSeekerApply> applied = jobSeekerApplyRepository.findByUserId(jobSeeker);
            List<JobSeekerSave> saved = jobSeekerSaveRepository.findByUserId(jobSeeker);

            for (JobPostActivity job : jobs) {
                boolean isApplied = applied.stream()
                        .anyMatch(a -> a.getJob() != null
                                && a.getJob().getJobPostId() == job.getJobPostId());
                boolean isSaved = saved.stream()
                        .anyMatch(s -> s.getJob() != null
                                && s.getJob().getJobPostId() == job.getJobPostId());

                job.setIsActive(isApplied);
                job.setIsSaved(isSaved);
            }
        }

        return jobs;
    }
}
