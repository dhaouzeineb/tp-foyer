@Entity
@Access(AccessType.FIELD)  // Explicitly set field access for Hibernate
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long idChambre;

    long numeroChambre;

    @Enumerated(EnumType.STRING)
    TypeChambre typeC;

    @OneToMany(mappedBy = "chambre")
    Set<Reservation> reservations;

    @ManyToOne(cascade = CascadeType.ALL)  // Make sure the cascade is appropriate
    Bloc bloc;
}
