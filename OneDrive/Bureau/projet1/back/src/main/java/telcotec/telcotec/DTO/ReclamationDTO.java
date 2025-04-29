package telcotec.telcotec.DTO;

import org.springframework.web.multipart.MultipartFile;

public class ReclamationDTO {
    private String description;
    private MultipartFile image;
    private MultipartFile voice;
    private MultipartFile video;

    // Getters et Setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }

    public MultipartFile getVoice() { return voice; }
    public void setVoice(MultipartFile voice) { this.voice = voice; }

    public MultipartFile getVideo() { return video; }
    public void setVideo(MultipartFile video) { this.video = video; }
}

